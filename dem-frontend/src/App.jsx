import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import ETokenABI from "./contracts/EToken.json";
import MarketplaceABI from "./contracts/EnergyMarketplace.json";
import { ETOKEN_ADDRESS, MARKETPLACE_ADDRESS } from "./contracts/config";
import "./App.css";

// ─── Tab constants ────────────────────────────────────────────────────────────
const TABS = ["dashboard", "market", "history", "income", "loyalty"];

function App() {
  // ─── Wallet state ───────────────────────────────────────────────────────────
  const [account, setAccount] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // ─── Balance state ──────────────────────────────────────────────────────────
  const [ethBalance, setEthBalance] = useState("0");
  const [etkBalance, setEtkBalance] = useState("0");
  const [loyaltyPoints, setLoyaltyPoints] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [collectedFees, setCollectedFees] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  // ─── Market state ───────────────────────────────────────────────────────────
  const [listings, setListings] = useState([]);
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  // ─── Transaction history ────────────────────────────────────────────────────
  const [txHistory, setTxHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ─── Income state ───────────────────────────────────────────────────────────
  const [incomeStats, setIncomeStats] = useState({
    totalEarned: "0",
    totalTrades: 0,
    totalETKSold: "0",
    avgPrice: "0",
  });

  // ─── UI state ───────────────────────────────────────────────────────────────
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mintAmount, setMintAmount] = useState("");
  const [mintAddress, setMintAddress] = useState("");

  // ─── Helpers ────────────────────────────────────────────────────────────────
  function showStatus(msg, type = "info") {
    setStatus(msg);
    setStatusType(type);
    if (type !== "error") setTimeout(() => setStatus(""), 5000);
  }

  function getContracts() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner().then((signer) => {
      const token = new ethers.Contract(ETOKEN_ADDRESS, ETokenABI.abi, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, signer);
      return { signer, token, marketplace, provider };
    });
  }

  // ─── Load all data ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(ETOKEN_ADDRESS, ETokenABI.abi, provider);
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

      // Check if owner
      try {
        const owner = await marketplace.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
        const fees = await marketplace.collectedFees();
        setCollectedFees(parseFloat(ethers.formatEther(fees)).toFixed(6));
      } catch (_) { }

      // Load listings
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

  // ─── Load transaction history ───────────────────────────────────────────────
  // Helper: format unix timestamp → "Apr 12, 2:30 PM"
  const formatTimestamp = (unixTs) => {
    if (!unixTs) return null;
    return new Date(unixTs * 1000).toLocaleString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const loadHistory = useCallback(async () => {
    if (!account) return;
    setLoadingHistory(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI.abi, provider);

      const tradedFilter = marketplace.filters.EnergyTraded();
      const listedFilter = marketplace.filters.EnergyListed();

      const [tradedEvents, listedEvents] = await Promise.all([
        marketplace.queryFilter(tradedFilter, 0, "latest"),
        marketplace.queryFilter(listedFilter, 0, "latest"),
      ]);

      // Fetch timestamps for all unique block numbers in parallel
      const allEvents = [...tradedEvents, ...listedEvents];
      const uniqueBlocks = [...new Set(allEvents.map((e) => e.blockNumber))];
      const blockData = await Promise.all(uniqueBlocks.map((bn) => provider.getBlock(bn)));
      const blockTimestamps = {};
      blockData.forEach((b) => { if (b) blockTimestamps[b.number] = b.timestamp; });

      // Process traded events
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
        timestamp: blockTimestamps[e.blockNumber] || null,
        isBuyer: e.args[1]?.toLowerCase() === account.toLowerCase(),
        isSeller: e.args[2]?.toLowerCase() === account.toLowerCase(),
      }));

      // Process listed events
      const listings = listedEvents.map((e) => ({
        type: "listed",
        txHash: e.transactionHash,
        listingId: e.args[0]?.toString(),
        seller: e.args[1],
        amountETK: e.args[2]?.toString(),
        priceETH: ethers.formatEther(e.args[3] || 0n),
        blockNumber: e.blockNumber,
        timestamp: blockTimestamps[e.blockNumber] || null,
        isMine: e.args[1]?.toLowerCase() === account.toLowerCase(),
      }));

      // Combine and sort
      const all = [...trades, ...listings].sort((a, b) => b.blockNumber - a.blockNumber);
      setTxHistory(all);

      // Compute income stats
      const myTrades = trades.filter((t) => t.isSeller);
      const totalEarned = myTrades.reduce((s, t) => s + parseFloat(t.priceETH), 0);
      const totalETKSold = myTrades.reduce((s, t) => s + parseFloat(t.amountETK), 0);
      setIncomeStats({
        totalEarned: totalEarned.toFixed(6),
        totalTrades: myTrades.length,
        totalETKSold: totalETKSold.toFixed(1),
        avgPrice: myTrades.length ? (totalEarned / myTrades.length).toFixed(6) : "0",
      });
    } catch (err) {
      console.error("loadHistory error:", err);
    }
    setLoadingHistory(false);
  }, [account]);

  // ─── Wallet actions ──────────────────────────────────────────────────────────
  async function connectWallet() {
    if (!window.ethereum) { alert("Please install MetaMask!"); return; }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    showStatus("Wallet connected!", "success");
  }

  async function switchAccount() {
    setShowMenu(false);
    try {
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      showStatus(`Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, "success");
    } catch (_) { showStatus("Switch cancelled.", "info"); }
  }

  function disconnectWallet() {
    setShowMenu(false);
    setAccount(null); setEthBalance("0"); setEtkBalance("0");
    setLoyaltyPoints("0"); setDiscount("0"); setListings([]);
    setTxHistory([]); setStatus(""); setIsOwner(false);
  }

  // ─── Marketplace actions ─────────────────────────────────────────────────────
  async function listEnergy() {
    if (!sellAmount || !sellPrice) { showStatus("Please enter amount and price!", "error"); return; }
    setLoading(true);
    showStatus("Step 1/2 — Approving tokens in MetaMask...", "info");
    try {
      const { token, marketplace } = await getContracts();
      const priceWei = ethers.parseEther(sellPrice);
      const amountBig = ethers.parseUnits(sellAmount, 18);
      const approveTx = await token.approve(MARKETPLACE_ADDRESS, amountBig);
      await approveTx.wait();
      showStatus("Step 2/2 — Confirming listing in MetaMask...", "info");
      const listTx = await marketplace.listEnergy(parseInt(sellAmount), priceWei);
      await listTx.wait();
      showStatus(`✅ Listed ${sellAmount} ETK for ${sellPrice} ETH!`, "success");
      setSellAmount(""); setSellPrice("");
      await loadData(); await loadHistory();
    } catch (err) { showStatus("❌ " + err.message, "error"); }
    setLoading(false);
  }

  async function buyEnergy(listingId, priceWei) {
    setLoading(true);
    showStatus("Confirm purchase in MetaMask...", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.buyEnergy(listingId, { value: priceWei });
      await tx.wait();
      showStatus("✅ Energy purchased! +10 loyalty points earned!", "success");
      await loadData(); await loadHistory();
    } catch (err) { showStatus("❌ " + err.message, "error"); }
    setLoading(false);
  }

  async function cancelListing(listingId) {
    setLoading(true);
    showStatus("Cancelling listing...", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.cancelListing(listingId);
      await tx.wait();
      showStatus("✅ Listing cancelled! ETK returned to your wallet.", "success");
      await loadData(); await loadHistory();
    } catch (err) { showStatus("❌ " + err.message, "error"); }
    setLoading(false);
  }

  async function withdrawFees() {
    setLoading(true);
    showStatus("Withdrawing platform fees...", "info");
    try {
      const { marketplace } = await getContracts();
      const tx = await marketplace.withdrawFees();
      await tx.wait();
      showStatus("✅ Fees withdrawn to your wallet!", "success");
      await loadData();
    } catch (err) { showStatus("❌ " + err.message, "error"); }
    setLoading(false);
  }

  async function mintTokens() {
    if (!mintAmount || !mintAddress) { showStatus("Enter address and amount!", "error"); return; }
    setLoading(true);
    showStatus("Minting ETK tokens...", "info");
    try {
      const { token } = await getContracts();
      const tx = await token.mint(mintAddress, mintAmount);
      await tx.wait();
      showStatus(`✅ Minted ${mintAmount} ETK to ${mintAddress.slice(0, 6)}...`, "success");
      setMintAmount(""); setMintAddress("");
      await loadData();
    } catch (err) { showStatus("❌ " + err.message, "error"); }
    setLoading(false);
  }

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (account) { loadData(); loadHistory(); }
  }, [account, loadData, loadHistory]);

  useEffect(() => {
    if (activeTab === "history" || activeTab === "income") loadHistory();
  }, [activeTab, loadHistory]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          showStatus(`Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, "success");
        } else disconnectWallet();
      });
    }
  }, []);

  // ─── Loyalty tier helper ────────────────────────────────────────────────────
  function loyaltyTier(pts) {
    const p = parseInt(pts);
    if (p >= 100) return { label: "🥇 Gold", color: "#f0b429", next: null, progress: 100 };
    if (p >= 50) return { label: "🥈 Silver", color: "#a0aec0", next: 100, progress: (p - 50) / 50 * 100 };
    if (p >= 10) return { label: "🥉 Bronze", color: "#c97d4e", next: 50, progress: (p - 10) / 40 * 100 };
    return { label: "⭐ Starter", color: "#888", next: 10, progress: p / 10 * 100 };
  }

  const tier = loyaltyTier(loyaltyPoints);

  // ─── Render helpers ──────────────────────────────────────────────────────────
  function shortAddr(addr) {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showStatus("📋 Address copied!", "success");
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="app" onClick={() => showMenu && setShowMenu(false)}>
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">⚡</div>
          <div className="header-brand-text">
            <h1>EnerDEX</h1>
            <span className="header-sub">Decentralized Energy Marketplace</span>
          </div>
        </div>

        {!account ? (
          <button className="btn-connect" onClick={connectWallet}>🦊 Connect MetaMask</button>
        ) : (
          <div className="wallet-dropdown" onClick={(e) => e.stopPropagation()}>
            <button className="wallet-pill" onClick={() => setShowMenu(!showMenu)}>
              <span className="wallet-dot" />
              {shortAddr(account)} ▾
            </button>
            {showMenu && (
              <div className="wallet-menu">
                <div className="wallet-menu-top">
                  <div className="wallet-menu-addr" onClick={() => copyToClipboard(account)} title="Click to copy">
                    📍 {account.slice(0, 12)}...{account.slice(-6)} 📋
                  </div>
                  <div className="wallet-menu-balances">
                    <span>💰 {ethBalance} ETH</span>
                    <span>⚡ {etkBalance} ETK</span>
                  </div>
                  <div className="wallet-menu-tier" style={{ color: tier.color }}>
                    {tier.label} · {loyaltyPoints} pts · {discount}% off
                  </div>
                </div>
                <button className="wallet-menu-item" onClick={switchAccount}>🔄 Switch Account</button>
                <button className="wallet-menu-item" onClick={() => { setShowMenu(false); setActiveTab("income"); }}>💰 My Income</button>
                <button className="wallet-menu-item" onClick={() => { setShowMenu(false); setActiveTab("loyalty"); }}>🏆 Loyalty Program</button>
                {isOwner && (
                  <button className="wallet-menu-item owner" onClick={() => { setShowMenu(false); setActiveTab("income"); }}>
                    👑 Admin Panel
                  </button>
                )}
                <button className="wallet-menu-item disconnect" onClick={disconnectWallet}>🔌 Disconnect</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── WELCOME ── */}
      {!account && (
        <div className="welcome">
          <div className="welcome-icon">⚡</div>
          <h2>Trade Renewable Energy</h2>
          <p>Peer-to-peer energy marketplace — no middlemen, no banks, just you and your neighbour.</p>
          <p className="welcome-badge">1 ETK = 1 kWh of renewable energy</p>
          <div className="welcome-features">
            <div className="wf">🔒 Escrow-protected trades</div>
            <div className="wf">🏆 Loyalty rewards</div>
            <div className="wf">📊 Full transaction history</div>
            <div className="wf">💰 Direct income to wallet</div>
          </div>
          <button className="btn-connect-large" onClick={connectWallet}>🦊 Connect MetaMask to Start</button>
        </div>
      )}

      {/* ── MAIN APP ── */}
      {account && (
        <div className="main-layout">
          {/* Status bar */}
          {status && (
            <div className={`status-bar status-${statusType}`}>
              {status}
              <button className="status-close" onClick={() => setStatus("")}>×</button>
            </div>
          )}

          {/* ── TABS ── */}
          <nav className="tabs">
            {[
              { id: "dashboard", icon: "🏠", label: "Dashboard" },
              { id: "market", icon: "🏪", label: "Market" },
              { id: "history", icon: "📜", label: "History" },
              { id: "income", icon: "💰", label: "Income" },
              { id: "loyalty", icon: "🏆", label: "Loyalty" },
            ].map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="tab-content">
            {/* ══════════════════ DASHBOARD TAB ══════════════════ */}
            {activeTab === "dashboard" && (
              <div className="dashboard">
                {/* KPI grid */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-icon">💎</div>
                    <div className="kpi-body">
                      <div className="kpi-label">ETH Balance</div>
                      <div className="kpi-value">{ethBalance}</div>
                      <div className="kpi-unit">ETH</div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">⚡</div>
                    <div className="kpi-body">
                      <div className="kpi-label">ETK Balance</div>
                      <div className="kpi-value">{etkBalance}</div>
                      <div className="kpi-unit">ETK tokens</div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon" style={{ color: tier.color }}>{tier.label.split(" ")[0]}</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Loyalty Points</div>
                      <div className="kpi-value">{loyaltyPoints}</div>
                      <div className="kpi-unit">{tier.label}</div>
                    </div>
                  </div>
                  <div className="kpi-card highlight">
                    <div className="kpi-icon">🎁</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Fee Discount</div>
                      <div className="kpi-value">{discount}%</div>
                      <div className="kpi-unit">off platform fee</div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="section-card">
                  <div className="section-header">
                    <h2>⚡ Quick List Energy</h2>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Amount (ETK)</label>
                      <input type="number" placeholder="e.g. 10" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Price (ETH)</label>
                      <input type="number" placeholder="e.g. 0.05" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={listEnergy} disabled={loading}>
                      {loading ? "⏳ Processing..." : "⚡ List Energy"}
                    </button>
                  </div>
                  {sellAmount && sellPrice && (
                    <div className="price-preview">
                      💡 You'll receive <strong>{(parseFloat(sellPrice) * 0.98).toFixed(6)} ETH</strong> after 2% platform fee
                      {discount > 0 && ` (with your ${discount}% loyalty discount → ${(parseFloat(sellPrice) * (1 - (2 * (1 - discount / 100)) / 100)).toFixed(6)} ETH)`}
                    </div>
                  )}
                </div>

                {/* Recent activity */}
                <div className="section-card">
                  <div className="section-header">
                    <h2>📊 Activity Summary</h2>
                    <button className="btn-ghost" onClick={() => setActiveTab("history")}>View All →</button>
                  </div>
                  <div className="activity-grid">
                    <div className="act-item">
                      <span className="act-label">Active Listings</span>
                      <span className="act-value">{listings.length}</span>
                    </div>
                    <div className="act-item">
                      <span className="act-label">Total Trades (as seller)</span>
                      <span className="act-value">{incomeStats.totalTrades}</span>
                    </div>
                    <div className="act-item">
                      <span className="act-label">ETK Sold</span>
                      <span className="act-value">{incomeStats.totalETKSold}</span>
                    </div>
                    <div className="act-item">
                      <span className="act-label">Total Earned</span>
                      <span className="act-value">{incomeStats.totalEarned} ETH</span>
                    </div>
                  </div>
                </div>

                {/* Owner admin panel */}
                {isOwner && (
                  <div className="section-card owner-panel">
                    <div className="section-header">
                      <h2>👑 Admin Panel</h2>
                      <span className="badge-owner">Contract Owner</span>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-stat">
                        <div className="admin-stat-label">Collected Fees</div>
                        <div className="admin-stat-value">{collectedFees} ETH</div>
                      </div>
                      <button className="btn-withdraw" onClick={withdrawFees} disabled={loading || parseFloat(collectedFees) === 0}>
                        💸 Withdraw Fees
                      </button>
                    </div>
                    <div className="mint-form">
                      <h3>🪙 Mint ETK Tokens</h3>
                      <div className="form-row">
                        <div className="form-field flex-2">
                          <label>Wallet Address</label>
                          <input placeholder="0x..." value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label>Amount (ETK)</label>
                          <input type="number" placeholder="e.g. 500" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
                        </div>
                        <button className="btn-mint" onClick={mintTokens} disabled={loading}>🪙 Mint</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════ MARKET TAB ══════════════════ */}
            {activeTab === "market" && (
              <div className="market">
                <div className="section-card">
                  <div className="section-header">
                    <h2>⚡ List Energy for Sale</h2>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Amount (ETK)</label>
                      <input type="number" placeholder="e.g. 10" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Price (ETH)</label>
                      <input type="number" placeholder="e.g. 0.05" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={listEnergy} disabled={loading}>
                      {loading ? "⏳ Processing..." : "⚡ List Energy"}
                    </button>
                  </div>
                  {sellAmount && sellPrice && (
                    <div className="price-preview">
                      💡 After 2% fee → <strong>{(parseFloat(sellPrice) * 0.98).toFixed(6)} ETH</strong> to your wallet
                    </div>
                  )}
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h2>🏪 Active Listings ({listings.length})</h2>
                    <button className="btn-ghost" onClick={loadData} disabled={loading}>🔄 Refresh</button>
                  </div>

                  {listings.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">⚡</div>
                      <h3>No active listings yet</h3>
                      <p>Be the first to list energy for sale above!</p>
                    </div>
                  ) : (
                    <div className="listings-grid">
                      {listings.map((l) => {
                        const isMine = l.seller.toLowerCase() === account.toLowerCase();
                        return (
                          <div className={`listing-card ${isMine ? "mine" : ""}`} key={l.id}>
                            <div className="listing-top">
                              <span className="listing-id">Listing #{l.id}</span>
                              <span className="listing-amount">{l.amountETK} ETK</span>
                            </div>
                            <div className="listing-price">{l.priceETH} ETH</div>
                            <div className="listing-per">
                              {(parseFloat(l.priceETH) / parseFloat(l.amountETK)).toFixed(6)} ETH/ETK
                            </div>
                            <div className="listing-seller" onClick={() => copyToClipboard(l.seller)} title="Click to copy">
                              {isMine ? "👤 You (seller)" : `Seller: ${shortAddr(l.seller)}`} 📋
                            </div>
                            {isMine ? (
                              <button className="btn-cancel" onClick={() => cancelListing(l.id)} disabled={loading}>
                                ✕ Cancel & Reclaim ETK
                              </button>
                            ) : (
                              <button className="btn-buy" onClick={() => buyEnergy(l.id, l.priceWei)} disabled={loading}>
                                ⚡ Buy Energy
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════ HISTORY TAB ══════════════════ */}
            {activeTab === "history" && (
              <div className="history">
                <div className="section-card">
                  <div className="section-header">
                    <h2>📜 Transaction History</h2>
                    <button className="btn-ghost" onClick={loadHistory} disabled={loadingHistory}>
                      {loadingHistory ? "Loading..." : "🔄 Refresh"}
                    </button>
                  </div>

                  {loadingHistory ? (
                    <div className="loading-state">
                      <div className="spinner" />
                      <p>Loading blockchain events...</p>
                    </div>
                  ) : txHistory.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📜</div>
                      <h3>No transactions yet</h3>
                      <p>Your trade history will appear here after your first transaction.</p>
                    </div>
                  ) : (
                    <div className="tx-list">
                      {txHistory.map((tx, i) => (
                        <div key={i} className={`tx-row ${tx.type}`}>
                          <div className="tx-icon">
                            {tx.type === "trade" ? (tx.isBuyer ? "⚡" : "💰") : "📋"}
                          </div>
                          <div className="tx-details">
                            <div className="tx-title">
                              {tx.type === "trade"
                                ? tx.isBuyer
                                  ? `Bought ${tx.amountETK} ETK`
                                  : tx.isSeller
                                    ? `Sold ${tx.amountETK} ETK`
                                    : `Trade: ${tx.amountETK} ETK`
                                : tx.isMine
                                  ? `Listed ${tx.amountETK} ETK`
                                  : `Listing: ${tx.amountETK} ETK`}
                            </div>
                            <div className="tx-meta">
                              {tx.timestamp ? formatTimestamp(tx.timestamp) : `Block #${tx.blockNumber}`}
                              {tx.type === "trade" && ` · ${tx.priceETH} ETH`}
                              {tx.type === "listed" && ` · ${tx.priceETH} ETH`}
                            </div>
                          </div>
                          <div className="tx-right">
                            <div className={`tx-badge ${tx.type === "trade" ? (tx.isBuyer ? "buy" : "sell") : "list"}`}>
                              {tx.type === "trade" ? (tx.isBuyer ? "BUY" : tx.isSeller ? "SELL" : "TRADE") : "LIST"}
                            </div>
                            <a
                              className="tx-hash"
                              href={`#${tx.txHash}`}
                              onClick={() => copyToClipboard(tx.txHash)}
                              title="Click to copy TX hash"
                            >
                              {tx.txHash.slice(0, 8)}... 📋
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════ INCOME TAB ══════════════════ */}
            {activeTab === "income" && (
              <div className="income">
                <div className="kpi-grid">
                  <div className="kpi-card income-card">
                    <div className="kpi-icon">💰</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Total Earned</div>
                      <div className="kpi-value">{incomeStats.totalEarned}</div>
                      <div className="kpi-unit">ETH from selling</div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">🔁</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Completed Sales</div>
                      <div className="kpi-value">{incomeStats.totalTrades}</div>
                      <div className="kpi-unit">trades as seller</div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">⚡</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Total ETK Sold</div>
                      <div className="kpi-value">{incomeStats.totalETKSold}</div>
                      <div className="kpi-unit">kWh of energy</div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">📈</div>
                    <div className="kpi-body">
                      <div className="kpi-label">Avg. Sale Price</div>
                      <div className="kpi-value">{incomeStats.avgPrice}</div>
                      <div className="kpi-unit">ETH per trade</div>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <h2>💡 How Income Works</h2>
                  <div className="info-steps">
                    <div className="info-step">
                      <div className="info-step-num">1</div>
                      <div>
                        <strong>You list energy</strong><br />
                        Your ETK tokens are locked in smart contract escrow. No one can touch them except through a valid purchase.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">2</div>
                      <div>
                        <strong>Buyer purchases</strong><br />
                        Buyer sends ETH → contract takes 2% platform fee → sends you the rest <em>instantly and automatically</em>.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">3</div>
                      <div>
                        <strong>ETH goes directly to your wallet</strong><br />
                        No withdrawal needed! Unlike centralised exchanges, the ETH from every sale lands directly in your MetaMask wallet the moment the trade settles.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">4</div>
                      <div>
                        <strong>Fee discount with loyalty</strong><br />
                        Earn loyalty points every trade. At 10 pts → 10% off fee, 50 pts → 25% off, 100 pts → 50% off.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sale history only */}
                <div className="section-card">
                  <div className="section-header">
                    <h2>💰 My Sales History</h2>
                  </div>
                  {txHistory.filter((t) => t.type === "trade" && t.isSeller).length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">💰</div>
                      <h3>No sales yet</h3>
                      <p>List some energy in the Market tab to start earning!</p>
                    </div>
                  ) : (
                    <div className="tx-list">
                      {txHistory
                        .filter((t) => t.type === "trade" && t.isSeller)
                        .map((tx, i) => (
                          <div key={i} className="tx-row trade">
                            <div className="tx-icon">💰</div>
                            <div className="tx-details">
                              <div className="tx-title">Sold {tx.amountETK} ETK</div>
                              <div className="tx-meta">
                                Buyer: {shortAddr(tx.buyer)} · {tx.timestamp ? formatTimestamp(tx.timestamp) : `Block #${tx.blockNumber}`}
                              </div>
                            </div>
                            <div className="tx-right">
                              <div className="tx-income">+{tx.priceETH} ETH</div>
                              <div className="tx-after-fee">≈{(parseFloat(tx.priceETH) * 0.98).toFixed(6)} after fee</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Admin fee withdrawal */}
                {isOwner && (
                  <div className="section-card owner-panel">
                    <div className="section-header">
                      <h2>👑 Platform Fee Withdrawal</h2>
                      <span className="badge-owner">Admin Only</span>
                    </div>
                    <div className="admin-grid">
                      <div className="admin-stat">
                        <div className="admin-stat-label">Accumulated Platform Fees</div>
                        <div className="admin-stat-value">{collectedFees} ETH</div>
                      </div>
                      <button
                        className="btn-withdraw"
                        onClick={withdrawFees}
                        disabled={loading || parseFloat(collectedFees) === 0}
                      >
                        💸 Withdraw {collectedFees} ETH to Wallet
                      </button>
                    </div>
                    <p className="admin-note">
                      💡 A 2% fee is collected on every trade. As the contract owner, you can withdraw accumulated fees to your wallet at any time.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════ LOYALTY TAB ══════════════════ */}
            {activeTab === "loyalty" && (
              <div className="loyalty">
                {/* Current tier card */}
                <div className="tier-hero" style={{ borderColor: tier.color }}>
                  <div className="tier-badge" style={{ color: tier.color }}>{tier.label}</div>
                  <div className="tier-points">{loyaltyPoints} <span>points</span></div>
                  <div className="tier-discount">
                    Current discount: <strong style={{ color: tier.color }}>{discount}% off platform fee</strong>
                  </div>
                  {tier.next && (
                    <div className="tier-progress-wrap">
                      <div className="tier-progress-label">
                        {tier.next - parseInt(loyaltyPoints)} pts to next tier
                      </div>
                      <div className="tier-progress-bar">
                        <div className="tier-progress-fill" style={{ width: `${tier.progress}%`, background: tier.color }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tiers table */}
                <div className="section-card">
                  <h2>🎯 Loyalty Tiers</h2>
                  <div className="tiers-list">
                    {[
                      { tier: "⭐ Starter", pts: "0–9 pts", disc: "0% off fee", desc: "Default for all new users" },
                      { tier: "🥉 Bronze", pts: "10–49 pts", disc: "10% off fee", desc: "Save 0.2% on every trade" },
                      { tier: "🥈 Silver", pts: "50–99 pts", disc: "25% off fee", desc: "Save 0.5% on every trade" },
                      { tier: "🥇 Gold", pts: "100+ pts", disc: "50% off fee", desc: "Save 1% on every trade — maximum discount!" },
                    ].map((t, i) => (
                      <div key={i} className={`tier-row ${parseInt(loyaltyPoints) >= [0, 10, 50, 100][i] ? "active-tier" : ""}`}>
                        <div className="tier-row-name">{t.tier}</div>
                        <div className="tier-row-pts">{t.pts}</div>
                        <div className="tier-row-disc">{t.disc}</div>
                        <div className="tier-row-desc">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to earn */}
                <div className="section-card">
                  <h2>💡 How It Works</h2>
                  <div className="info-steps">
                    <div className="info-step">
                      <div className="info-step-num">+10</div>
                      <div>
                        <strong>Every completed trade</strong><br />
                        Both buyer AND seller earn +10 loyalty points whenever a trade is completed on the marketplace. Points accumulate automatically on-chain — no sign-up needed.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">🎁</div>
                      <div>
                        <strong>Fee discount applies automatically</strong><br />
                        When you reach a tier threshold, the fee discount is applied to your <em>next purchase</em> automatically by the smart contract. You don't need to do anything.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">🔒</div>
                      <div>
                        <strong>Points live on the blockchain</strong><br />
                        Unlike loyalty programs from centralised apps, your points are stored in the smart contract. No company can revoke, expire, or manipulate them.
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="info-step-num">📊</div>
                      <div>
                        <strong>Real savings on fees</strong><br />
                        Platform fee is 2%. Gold tier members pay only 1% — that's a 50% saving on every purchase. The more you trade, the less you pay in fees.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee calculator */}
                <div className="section-card">
                  <h2>🧮 Fee Calculator</h2>
                  <p style={{ color: "var(--c-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                    See how much you save at your current tier on a trade.
                  </p>
                  <div className="fee-calc">
                    {[0.01, 0.05, 0.1, 0.5, 1.0].map((price) => {
                      const baseFee = price * 0.02;
                      const discFee = baseFee * (1 - parseInt(discount) / 100);
                      const saving = baseFee - discFee;
                      return (
                        <div key={price} className="fee-row">
                          <span className="fee-price">{price} ETH trade</span>
                          <span className="fee-base">Base fee: {baseFee.toFixed(6)} ETH</span>
                          <span className="fee-you">You pay: {discFee.toFixed(6)} ETH</span>
                          {saving > 0 && <span className="fee-saving">Save {saving.toFixed(6)} ETH</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;