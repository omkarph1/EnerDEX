import { useWallet } from "../context/WalletContext";
import EnergyForm from "../components/EnergyForm";
import ListingCard from "../components/ListingCard";

export default function Market() {
  const {
    account, listings, loading, discount,
    listEnergy, buyEnergy, cancelListing, showStatus,
  } = useWallet();

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showStatus("📋 Address copied!", "success");
  }

  return (
    <div className="market">
      {/* List Energy form */}
      <div className="section-card">
        <div className="section-header">
          <h2>⚡ List Energy for Sale</h2>
          <span style={{ fontSize: "0.82rem", color: "var(--c-muted)" }}>
            {listings.length} active listing{listings.length !== 1 ? "s" : ""}
          </span>
        </div>
        <EnergyForm onSubmit={listEnergy} loading={loading} discount={discount} />
      </div>

      {/* Listings grid */}
      <div className="section-card">
        <h2>🏪 Active Listings</h2>
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No active listings</h3>
            <p>Be the first to list energy for sale!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                account={account}
                onBuy={buyEnergy}
                onCancel={cancelListing}
                onCopy={copyToClipboard}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
