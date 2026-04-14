import { useState } from "react";

export default function EnergyForm({ onSubmit, loading, discount }) {
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice]   = useState("");

  async function handleSubmit() {
    const ok = await onSubmit(sellAmount, sellPrice);
    if (ok) { setSellAmount(""); setSellPrice(""); }
  }

  return (
    <>
      <div className="form-row">
        <div className="form-field">
          <label>Amount (ETK)</label>
          <input
            type="number"
            placeholder="e.g. 10"
            min="1"
            step="1"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Price (ETH)</label>
          <input
            type="number"
            placeholder="e.g. 0.05"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ Processing…" : "⚡ List Energy"}
        </button>
      </div>
      {sellAmount && sellPrice && (
        <div className="price-preview">
          💡 You'll receive{" "}
          <strong>{(parseFloat(sellPrice) * 0.98).toFixed(6)} ETH</strong> after 2%
          platform fee
          {parseInt(discount) > 0 &&
            ` (with your ${discount}% loyalty discount → ${(
              parseFloat(sellPrice) *
              (1 - (2 * (1 - parseInt(discount) / 100)) / 100)
            ).toFixed(6)} ETH)`}
        </div>
      )}
    </>
  );
}
