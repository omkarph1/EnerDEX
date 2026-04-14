import { useWallet } from "../context/WalletContext";
import { loyaltyTier } from "../utils/helpers";

export default function Loyalty() {
  const { loyaltyPoints, discount } = useWallet();
  const tier = loyaltyTier(loyaltyPoints);

  return (
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
              <div
                className="tier-progress-fill"
                style={{ width: `${tier.progress}%`, background: tier.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tiers table */}
      <div className="section-card">
        <h2>🎯 Loyalty Tiers</h2>
        <div className="tiers-list">
          {[
            { tier: "⭐ Starter", pts: "0–9 pts",   disc: "0% off fee",  desc: "Default for all new users" },
            { tier: "🥉 Bronze",  pts: "10–49 pts",  disc: "10% off fee", desc: "Save 0.2% on every trade" },
            { tier: "🥈 Silver",  pts: "50–99 pts",  disc: "25% off fee", desc: "Save 0.5% on every trade" },
            { tier: "🥇 Gold",    pts: "100+ pts",   disc: "50% off fee", desc: "Save 1% on every trade — maximum discount!" },
          ].map((t, i) => (
            <div
              key={t.tier}
              className={`tier-row ${parseInt(loyaltyPoints) >= [0, 10, 50, 100][i] ? "active-tier" : ""}`}
            >
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
            const saving  = baseFee - discFee;
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
  );
}
