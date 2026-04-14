import { useWallet } from "../context/WalletContext";
import TxRow from "../components/TxRow";

export default function History() {
  const { account, txHistory, loadingHistory, showStatus } = useWallet();

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showStatus("📋 Copied!", "success");
  }

  const myTxns = txHistory.filter(
    (t) => t.isBuyer || t.isSeller || t.isMine
  );

  return (
    <div className="history">
      <div className="section-card">
        <div className="section-header">
          <h2>📜 Transaction History</h2>
          <span style={{ fontSize: "0.82rem", color: "var(--c-muted)" }}>
            {myTxns.length} transaction{myTxns.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loadingHistory ? (
          <div className="tx-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer-card" style={{ height: "60px", marginBottom: "0.5rem" }}></div>
            ))}
          </div>
        ) : myTxns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h3>No transactions yet</h3>
            <p>Your buy, sell, and listing activity will appear here.</p>
          </div>
        ) : (
          <div className="tx-list">
            {/** BUG FIX #6 — use txHash+type as key instead of array index */}
            {myTxns.map((tx) => (
              <TxRow
                key={tx.txHash + tx.type}
                tx={tx}
                account={account}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </div>

      {/* All platform activity */}
      <div className="section-card">
        <div className="section-header">
          <h2>🌐 All Platform Activity</h2>
          <span style={{ fontSize: "0.82rem", color: "var(--c-muted)" }}>
            {txHistory.length} total event{txHistory.length !== 1 ? "s" : ""}
          </span>
        </div>
        {txHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <h3>No platform activity</h3>
          </div>
        ) : (
          <div className="tx-list">
            {txHistory.map((tx) => (
              <TxRow
                key={tx.txHash + tx.type + tx.listingId}
                tx={tx}
                account={account}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
