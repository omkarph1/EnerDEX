import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { loyaltyTier } from "../utils/helpers";
import KpiCard from "../components/KpiCard";
import EnergyForm from "../components/EnergyForm";

export default function Dashboard() {
  const {
    account, ethBalance, etkBalance, loyaltyPoints, discount,
    isOwner, collectedFees, listings, txHistory,
    loading, listEnergy, mintTokens,
  } = useWallet();

  const [mintAmount, setMintAmount]   = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const tier = loyaltyTier(loyaltyPoints);

  async function handleMint() {
    const ok = await mintTokens(mintAddress, mintAmount);
    if (ok) { setMintAmount(""); setMintAddress(""); }
  }

  /* activity stats */
  const myListings = listings.filter((l) => l.seller.toLowerCase() === account?.toLowerCase()).length;
  const myTrades   = txHistory.filter((t) => t.type === "trade" && (t.isBuyer || t.isSeller)).length;

  return (
    <div className="dashboard">
      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard icon="💰" label="ETH Balance" value={ethBalance} unit="ETH" />
        <KpiCard icon="⚡" label="ETK Balance" value={etkBalance} unit="ETK tokens" highlight />
        <KpiCard icon="🏆" label="Loyalty Points" value={loyaltyPoints} unit={tier.label} highlightColor={tier.color} />
        <KpiCard icon="🎁" label="Fee Discount" value={`${discount}%`} unit="off platform fee" highlightColor="#00d4aa" />
      </div>

      {/* Quick List Energy */}
      <div className="section-card">
        <h2>⚡ Quick List Energy</h2>
        <EnergyForm onSubmit={listEnergy} loading={loading} discount={discount} />
      </div>

      {/* Activity Summary */}
      <div className="section-card">
        <h2>📊 Activity Summary</h2>
        <div className="activity-grid">
          <div className="act-item">
            <div className="act-label">Active Listings</div>
            <div className="act-value">{listings.length}</div>
          </div>
          <div className="act-item">
            <div className="act-label">My Listings</div>
            <div className="act-value">{myListings}</div>
          </div>
          <div className="act-item">
            <div className="act-label">My Trades</div>
            <div className="act-value">{myTrades}</div>
          </div>
          <div className="act-item">
            <div className="act-label">Total On-Chain Txns</div>
            <div className="act-value">{txHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Admin panel — owner only */}
      {isOwner && (
        <div className="section-card owner-panel">
          <div className="section-header">
            <h2>👑 Contract Owner Panel</h2>
            <span className="badge-owner">Admin Only</span>
          </div>

          {/* Mint */}
          <div className="mint-form">
            <h3>🪙 Mint New ETK Tokens</h3>
            <div className="form-row">
              <div className="form-field flex-2">
                <label>Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x…"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Amount (ETK)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                />
              </div>
              <button className="btn-mint" onClick={handleMint} disabled={loading}>
                🪙 Mint
              </button>
            </div>
          </div>

          <p className="admin-note" style={{ marginTop: "1rem" }}>
            💡 As the contract owner you can mint new ETK tokens to any address.
            Accumulated platform fees can be withdrawn from the Income tab.
          </p>
        </div>
      )}
    </div>
  );
}
