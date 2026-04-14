import { useWallet } from "../context/WalletContext";
import { shortAddr, formatTimestamp } from "../utils/helpers";
import KpiCard from "../components/KpiCard";

export default function Income() {
  const {
    account, discount, incomeStats, txHistory, loading,
    isOwner, collectedFees, withdrawFees, showStatus,
  } = useWallet();

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showStatus("📋 Copied!", "success");
  }

  const myTrades = txHistory.filter((t) => t.type === "trade" && t.isSeller);

  return (
    <div className="income">
      {/* Income KPIs */}
      <div className="kpi-grid">
        <KpiCard icon="💰" label="Total Earned"   value={incomeStats.totalEarned} unit="ETH" highlightColor="#48c774" />
        <KpiCard icon="📊" label="Total Trades"   value={incomeStats.totalTrades} unit="completed sales" />
        <KpiCard icon="⚡" label="ETK Sold"       value={incomeStats.totalETKSold} unit="tokens" />
        <KpiCard icon="📈" label="Avg. Sale Price" value={incomeStats.avgPrice} unit="ETH / trade" />
      </div>

      {/* How Income Works */}
      <div className="section-card">
        <h2>📖 How Seller Income Works</h2>
        <div className="info-steps">
          <div className="info-step">
            <div className="info-step-num">1</div>
            <div>
              <strong>List energy tokens for sale</strong><br />
              Set your price in ETH. Tokens are held in escrow by the smart contract.
            </div>
          </div>
          <div className="info-step">
            <div className="info-step-num">2</div>
            <div>
              <strong>Buyer purchases your listing</strong><br />
              Buyer sends ETH → contract deducts a 2% platform fee (reduced by buyer's loyalty discount) → rest goes to you.
            </div>
          </div>
          <div className="info-step">
            <div className="info-step-num">3</div>
            <div>
              <strong>ETH arrives in your wallet automatically</strong><br />
              No withdrawal needed — the smart contract transfers your payout in the same transaction.
            </div>
          </div>
        </div>
      </div>

      {/* Sale history */}
      <div className="section-card">
        <div className="section-header">
          <h2>💰 My Sales History</h2>
        </div>
        {myTrades.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No sales yet</h3>
            <p>List some energy in the Market tab to start earning!</p>
          </div>
        ) : (
          <div className="tx-list">
            {myTrades.map((tx) => (
              <div key={tx.txHash} className="tx-row trade">
                <div className="tx-icon">💰</div>
                <div className="tx-details">
                  <div className="tx-title">Sold {tx.amountETK} ETK</div>
                  <div className="tx-meta">
                    Buyer: {shortAddr(tx.buyer)} · {tx.timestamp ? formatTimestamp(tx.timestamp) : `Block #${tx.blockNumber}`}
                  </div>
                </div>
                <div className="tx-right">
                  <div className="tx-income">+{tx.priceETH} ETH</div>
                  {/** BUG FIX #16 — use actual discount instead of hardcoded 2% */}
                  <div className="tx-after-fee">
                    ≈{(parseFloat(tx.priceETH) * (1 - (2 * (1 - parseInt(discount) / 100)) / 100)).toFixed(6)} after fee
                  </div>
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
  );
}
