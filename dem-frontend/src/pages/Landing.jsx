import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Landing() {
  const { connectWallet } = useWallet();
  const navigate = useNavigate();

  async function handleConnect() {
    const acc = await connectWallet();
    if (acc) navigate("/dashboard");
  }

  return (
    <div className="landing">
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-icon">⚡</div>
        <h1 className="hero-title">Decentralized Energy Marketplace</h1>
        <p className="hero-subtitle">
          Powering the future by trading renewable energy peer-to-peer on the Ethereum blockchain.
        </p>
        <div className="hero-cta-area">
          <div className="hero-conversion-badge">
            <span className="conversion-icon">🔋</span>
            <span className="conversion-text"><strong>1 ETK</strong> = <strong>1 kWh</strong> of Renewable Energy</span>
          </div>
          <button className="btn-connect-hero" onClick={handleConnect}>
            🦊 Connect MetaMask to Enter
          </button>
        </div>
      </div>

      {/* The Story: Problem vs Solution */}
      <div className="landing-story">
        <div className="story-section problem">
          <div className="story-icon">🏢</div>
          <h2>The Problem: Centralized Grids</h2>
          <p>
            In traditional energy markets, a <strong>central utility company</strong> acts as the middleman. They buy energy from producers cheaply, and sell it to consumers at a premium. 
          </p>
          <ul className="story-list">
            <li>❌ <strong>High Intermediary Fees:</strong> Middlemen take a huge cut of every transaction.</li>
            <li>❌ <strong>Opaque Pricing:</strong> Consumers have no control or visibility over price setting.</li>
            <li>❌ <strong>Single Point of Failure:</strong> Centralized servers are vulnerable to censorship and outages.</li>
          </ul>
        </div>

        <div className="story-divider">
          <span>VS</span>
        </div>

        <div className="story-section solution">
          <div className="story-icon">⛓️</div>
          <h2>The Solution: EnerDEX</h2>
          <p>
            We use Ethereum smart contracts to remove the middleman completely. Energy producers list tokenized energy (<strong>ETK</strong>) directly, and consumers buy it.
          </p>
          <ul className="story-list">
            <li>✅ <strong>Zero Intermediaries:</strong> Smart contracts handle the escrow and settlement automatically.</li>
            <li>✅ <strong>Transparent Pricing:</strong> All listings and prices are stored immutably on the blockchain.</li>
            <li>✅ <strong>Low Fees & Rewards:</strong> A fixed 2% fee, reduced linearly up to 50% through on-chain loyalty rewards.</li>
          </ul>
        </div>
      </div>

      {/* Key Blockchain Features */}
      <div className="landing-features">
        <h3>How Blockchain Makes It Possible</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="f-icon">🔒</div>
            <h4>Trustless Escrow</h4>
            <p>Sellers deposit ETK tokens into the smart contract. They are locked until a buyer pays the exact ETH price, ensuring no one gets scammed.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">⚡</div>
            <h4>Atomic Settlement</h4>
            <p>ETK is transferred to the buyer, and ETH is transferred to the seller in a single, instantaneous transaction block.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon">🏆</div>
            <h4>Immutable Loyalty</h4>
            <p>Every trade earns points. Your loyalty tier and fee discounts are stored on the blockchain forever—no corporate entity can revoke them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
