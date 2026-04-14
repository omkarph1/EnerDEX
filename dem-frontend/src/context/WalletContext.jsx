import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import ETokenABI from "../contracts/EToken.json";
import MarketplaceABI from "../contracts/EnergyMarketplace.json";
import { ETOKEN_ADDRESS, MARKETPLACE_ADDRESS } from "../contracts/config";
import { parseError } from "../utils/helpers";

const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }) {
  /* ── Wallet ──────────────────────────────────────────────── */
  const [account, setAccount] = useState(null);

  /* ── Balances ────────────────────────────────────────────── */
  const [ethBalance, setEthBalance]     = useState("0");
  const [etkBalance, setEtkBalance]     = useState("0");
  const [loyaltyPoints, setLoyaltyPoints] = useState("0");
  const [discount, setDiscount]         = useState("0");
  const [collectedFees, setCollectedFees] = useState("0");
  const [isOwner, setIsOwner]           = useState(false);

  /* ── Market ──────────────────────────────────────────────── */
  const [listings, setListings] = useState([]);

  /* ── History ─────────────────────────────────────────────── */
  const [txHistory, setTxHistory]         = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Income ──────────────────────────────────────────────── */
  const [incomeStats, setIncomeStats] = useState({
    totalEarned: "0", totalTrades: 0, totalETKSold: "0", avgPrice: "0",
  });

  /* ── UI ──────────────────────────────────────────────────── */
  const [status, setStatus]       = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading]     = useState(false);

  /* ─── Helpers ────────────────────────────────────────────── */
  function showStatus(msg, type = "info") {
    setStatus(msg);
    setStatusType(type);
    if (type !== "error") setTimeout(() => setStatus(""), 5000);
  }

  /** BUG FIX #3 — guard against missing MetaMask */
  function getContracts() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install it to continue.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner().then((signer) => {
      const token       = new ethers.Contract(ETOKEN_ADDRESS, ETokenABI.abi, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);
      return { signer, token, marketplace, provider };
    });
  }

  /* ─── Load on-chain data ─────────────────────────────────── */
  const loadData = useCallback(async () => {
    if (!account || !window.ethereum) return;
    try {
      const provider    = new ethers.BrowserProvider(window.ethereum);
      const token       = new ethers.Contract(ETOKEN_ADDRESS, ETokenABI.abi, provider);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);

      const [eth, etk, pts, disc] = await Promise.all([
        provider.getBalance(account),
        token.balanceOf(account),
        marketplace.loyaltyPoints(account),
        marketplace.getDiscount(account),
      ]);

      setEthBalance(parseFloat(ethers.formatEther(eth)).toFixed(4));
      setEtkBalance(parseFloat(ethers.formatUnits(etk, 18)).toFixed(1));
      setLoyaltyPoints(pts.toString());
      setDiscount(disc.toString());

      try {
        const owner = await marketplace.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        const fees = await marketplace.collectedFees();
        setCollectedFees(parseFloat(ethers.formatEther(fees)).toFixed(6));
      } catch (_) { /* non-owner — ignore */ }

      const count = await marketplace.listingCount();
      const all = [];
      for (let i = 0; i < count; i++) {
        const l = await marketplace.getListing(i);
        if (l.isActive) {
          all.push({
            id: i,
            seller: l.seller,
            amountETK: l.amountETK.toString(),
            priceETH: ethers.formatEther(l.priceWei),
            priceWei: l.priceWei,
          });
        }
      }
      setListings(all);
    } catch (err) {
      console.error("loadData error:", err);
    }
  }, [account]);

  /* ─── Load transaction history ───────────────────────────── */
  const loadHistory = useCallback(async () => {
    if (!account || !window.ethereum) return;
    setLoadingHistory(true);
    try {
      const provider    = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);

      /* Fetch only the last 50,000 blocks to avoid timeout issues on public networks */
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 50000);

      const [tradedEvents, listedEvents] = await Promise.all([
        marketplace.queryFilter(marketplace.filters.EnergyTraded(), startBlock, "latest"),
        marketplace.queryFilter(marketplace.filters.EnergyListed(), startBlock, "latest"),
      ]);

      /* fetch block timestamps in parallel */
      const allEvents    = [...tradedEvents, ...listedEvents];
      const uniqueBlocks = [...new Set(allEvents.map((e) => e.blockNumber))];
      const blockData    = await Promise.all(uniqueBlocks.map((bn) => provider.getBlock(bn)));
      const tsMap = {};
      blockData.forEach((b) => { if (b) tsMap[b.number] = b.timestamp; });

      const trades = tradedEvents.map((e) => ({
        type: "trade",
        txHash: e.transactionHash,
        listingId: e.args[0]?.toString(),
        buyer: e.args[1],
        seller: e.args[2],
        amountETK: e.args[3]?.toString(),
        priceWei: e.args[4],
        priceETH: ethers.formatEther(e.args[4] || 0n),
        blockNumber: e.blockNumber,
        timestamp: tsMap[e.blockNumber] || null,
        isBuyer:  e.args[1]?.toLowerCase() === account.toLowerCase(),
        isSeller: e.args[2]?.toLowerCase() === account.toLowerCase(),
      }));

      const listed = listedEvents.map((e) => ({
        type: "listed",
        txHash: e.transactionHash,
        listingId: e.args[0]?.toString(),
        seller: e.args[1],
        amountETK: e.args[2]?.toString(),
        priceETH: ethers.formatEther(e.args[3] || 0n),
        blockNumber: e.blockNumber,
        timestamp: tsMap[e.blockNumber] || null,
        isMine: e.args[1]?.toLowerCase() === account.toLowerCase(),
      }));

      const combined = [...trades, ...listed].sort((a, b) => b.blockNumber - a.blockNumber);
      setTxHistory(combined);

      /* income stats */
      const myTrades    = trades.filter((t) => t.isSeller);
      const totalEarned = myTrades.reduce((s, t) => s + parseFloat(t.priceETH), 0);
      const totalETK    = myTrades.reduce((s, t) => s + parseFloat(t.amountETK), 0);
      setIncomeStats({
        totalEarned:  totalEarned.toFixed(6),
        totalTrades:  myTrades.length,
        totalETKSold: totalETK.toFixed(1),
        avgPrice:     myTrades.length ? (totalEarned / myTrades.length).toFixed(6) : "0",
      });
    } catch (err) {
      console.error("loadHistory error:", err);
      /** BUG FIX #5 — surface load errors to the UI */
      showStatus("Failed to load transaction history.", "error");
    }
    setLoadingHistory(false);
  }, [account]);

  /* ─── Wallet actions ─────────────────────────────────────── */
  async function connectWallet() {
    if (!window.ethereum) { alert("Please install MetaMask!"); return null; }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      showStatus("Wallet connected!", "success");
      return accounts[0];
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
      return null;
    }
  }

  async function switchAccount() {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      showStatus(`Switched to ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`, "success");
    } catch (_) {
      showStatus("Switch cancelled.", "info");
    }
  }

  function disconnectWallet() {
    setAccount(null);
    setEthBalance("0"); setEtkBalance("0");
    setLoyaltyPoints("0"); setDiscount("0");
    setListings([]); setTxHistory([]);
    setStatus(""); setIsOwner(false);
  }

  /* ─── Marketplace actions ────────────────────────────────── */
  async function listEnergy(sellAmount, sellPrice) {
    if (!sellAmount || !sellPrice) {
      showStatus("Please enter amount and price!", "error"); return false;
    }
    /** BUG FIX #2 — prevent decimal ETK amounts (contract uses integer math) */
    if (!Number.isInteger(Number(sellAmount)) || Number(sellAmount) <= 0) {
      showStatus("ETK amount must be a whole number (e.g. 1, 5, 10).", "error");
      return false;
    }
    setLoading(true);
    showStatus("Step 1/2 — Approving tokens in MetaMask…", "info");
    try {
      const { token, marketplace } = await getContracts();
      const priceWei  = ethers.parseEther(sellPrice);
      const amountBig = ethers.parseUnits(sellAmount, 18);

      const approveTx = await token.approve(MARKETPLACE_ADDRESS, amountBig);
      await approveTx.wait();

      showStatus("Step 2/2 — Confirming listing in MetaMask…", "info");
      const listTx = await marketplace.listEnergy(parseInt(sellAmount), priceWei);
      await listTx.wait();

      showStatus(`✅ Listed ${sellAmount} ETK for ${sellPrice} ETH!`, "success");
      await loadData();
      await loadHistory();
      setLoading(false);
      return true;
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
    }
    setLoading(false);
    return false;
  }

  async function buyEnergy(listingId, priceWei) {
    setLoading(true);
    showStatus("Confirm purchase in MetaMask…", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.buyEnergy(listingId, { value: priceWei });
      await tx.wait();
      showStatus("✅ Energy purchased! +10 loyalty points earned!", "success");
      await loadData();
      await loadHistory();
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
    }
    setLoading(false);
  }

  async function cancelListing(listingId) {
    setLoading(true);
    showStatus("Cancelling listing…", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.cancelListing(listingId);
      await tx.wait();
      showStatus("✅ Listing cancelled! ETK returned to your wallet.", "success");
      await loadData();
      await loadHistory();
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
    }
    setLoading(false);
  }

  async function withdrawFees() {
    setLoading(true);
    showStatus("Withdrawing platform fees…", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.withdrawFees();
      await tx.wait();
      showStatus("✅ Fees withdrawn to your wallet!", "success");
      await loadData();
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
    }
    setLoading(false);
  }

  async function mintTokens(mintAddress, mintAmount) {
    if (!mintAmount || !mintAddress) {
      showStatus("Enter address and amount!", "error"); return false;
    }
    setLoading(true);
    showStatus("Minting ETK tokens…", "info");
    try {
      const { token } = await getContracts();
      const tx = await token.mint(mintAddress, mintAmount);
      await tx.wait();
      showStatus(`✅ Minted ${mintAmount} ETK to ${mintAddress.slice(0, 6)}…`, "success");
      await loadData();
      setLoading(false);
      return true;
    } catch (err) {
      showStatus("❌ " + parseError(err), "error");
    }
    setLoading(false);
    return false;
  }

  /* ─── Effects ────────────────────────────────────────────── */
  /** BUG FIX #4 — improved Hardhat restart detection with localStorage */
  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      try {
        const chainId  = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0x7a69") return;           // only for Hardhat local
        const blockHex = await window.ethereum.request({ method: "eth_blockNumber" });
        const blockNum = parseInt(blockHex, 16);
        const prev     = parseInt(localStorage.getItem("enerdex_lastBlock") || "0");
        if (prev > 0 && blockNum < prev) {
          alert(
            "⚠️ Hardhat node was restarted!\n\n" +
            "Please reset MetaMask:\nSettings → Advanced → Reset Account\n\n" +
            "Then refresh this page."
          );
        }
        localStorage.setItem("enerdex_lastBlock", blockNum.toString());
      } catch (err) {
        console.error("Network check failed:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (account) { loadData(); loadHistory(); }
  }, [account, loadData, loadHistory]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        showStatus(`Switched to ${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`, "success");
      } else {
        disconnectWallet();
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum.removeListener("accountsChanged", handler);
  }, []);

  /* ─── Context value ──────────────────────────────────────── */
  const value = {
    account, connectWallet, switchAccount, disconnectWallet,
    ethBalance, etkBalance, loyaltyPoints, discount, collectedFees, isOwner,
    listings, txHistory, loadingHistory, incomeStats,
    status, statusType, loading, showStatus,
    loadData, loadHistory, listEnergy, buyEnergy, cancelListing, withdrawFees, mintTokens,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
