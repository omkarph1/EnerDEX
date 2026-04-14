import { formatTimestamp, shortAddr } from "../utils/helpers";

/**
 * BUG FIX #6 — Use tx.txHash (stable id) instead of array index for React key.
 * Parent should use: <TxRow key={tx.txHash + tx.type} ... />
 */
export default function TxRow({ tx, account, onCopy }) {
  const isBuyer  = tx.buyer?.toLowerCase()  === account?.toLowerCase();
  const isSeller = tx.seller?.toLowerCase() === account?.toLowerCase();

  let title;
  if (tx.type === "trade") {
    title = isBuyer ? `Bought ${tx.amountETK} ETK` : isSeller ? `Sold ${tx.amountETK} ETK` : `Trade: ${tx.amountETK} ETK`;
  } else {
    title = tx.isMine ? `Listed ${tx.amountETK} ETK` : `Listing: ${tx.amountETK} ETK`;
  }

  const badgeType = tx.type === "trade" ? (isBuyer ? "buy" : "sell") : "list";
  const badgeLabel = tx.type === "trade" ? (isBuyer ? "BUY" : isSeller ? "SELL" : "TRADE") : "LIST";

  return (
    <div className={`tx-row ${tx.type}`}>
      <div className="tx-icon">
        {tx.type === "trade" ? (isBuyer ? "⚡" : "💰") : "📋"}
      </div>
      <div className="tx-details">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">
          {tx.timestamp ? formatTimestamp(tx.timestamp) : `Block #${tx.blockNumber}`}
          {" · "}
          {tx.priceETH} ETH
        </div>
      </div>
      <div className="tx-right">
        <div className={`tx-badge ${badgeType}`}>{badgeLabel}</div>
        <a
          className="tx-hash"
          href={`#${tx.txHash}`}
          onClick={(e) => {
            e.preventDefault();
            onCopy(tx.txHash);
          }}
          title="Click to copy TX hash"
        >
          {tx.txHash.slice(0, 8)}… 📋
        </a>
      </div>
    </div>
  );
}
