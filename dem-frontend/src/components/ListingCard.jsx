import { shortAddr } from "../utils/helpers";

export default function ListingCard({ listing, account, onBuy, onCancel, onCopy, loading }) {
  const isMine = listing.seller.toLowerCase() === account.toLowerCase();

  return (
    <div className={`listing-card ${isMine ? "mine" : ""}`}>
      <div className="listing-top">
        <span className="listing-id">Listing #{listing.id}</span>
        <span className="listing-amount">{listing.amountETK} ETK</span>
      </div>
      <div className="listing-price">{listing.priceETH} ETH</div>
      <div className="listing-per">
        {(parseFloat(listing.priceETH) / parseFloat(listing.amountETK)).toFixed(6)} ETH/ETK
      </div>
      <div
        className="listing-seller"
        onClick={() => onCopy(listing.seller)}
        title="Click to copy"
      >
        {isMine ? "👤 You (seller)" : `Seller: ${shortAddr(listing.seller)}`} 📋
      </div>
      {isMine ? (
        <button className="btn-cancel" onClick={() => onCancel(listing.id)} disabled={loading}>
          ✕ Cancel & Reclaim ETK
        </button>
      ) : (
        <button className="btn-buy" onClick={() => onBuy(listing.id, listing.priceWei)} disabled={loading}>
          ⚡ Buy Energy
        </button>
      )}
    </div>
  );
}
