import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="info-page">
      {/* Hero */}
      <div className="info-hero">
        <span className="info-hero-icon">📖</span>
        <h2>How EnerDEX Works</h2>
        <p>
          A complete walkthrough of how our decentralized energy marketplace operates
          on the Ethereum blockchain — from listing to settlement.
        </p>
      </div>

      {/* 1 — What is DEM */}
      <section className="info-section">
        <div className="info-section-number">01</div>
        <div className="info-section-body">
          <h3>What is a Decentralized Energy Marketplace?</h3>
          <p>
            In a traditional energy market, a <strong>central utility company</strong> acts as
            the middleman — buying energy from producers and selling it to consumers. This
            creates a single point of failure, opaque pricing, and high intermediary fees.
          </p>
          <p>
            EnerDEX removes the middleman entirely. Using <strong>smart contracts</strong> deployed
            on the Ethereum blockchain, energy producers can list tokenized energy (ETK) for sale, and
            consumers can purchase it directly — <em>peer-to-peer</em>, with no central authority.
          </p>
          <div className="info-highlight-box">
            <div className="info-highlight-row">
              <span className="info-h-label">Traditional</span>
              <span className="info-h-flow">Producer → <strong>Utility Co.</strong> → Consumer</span>
            </div>
            <div className="info-divider" />
            <div className="info-highlight-row accent">
              <span className="info-h-label">EnerDEX</span>
              <span className="info-h-flow">Producer → <strong>Smart Contract</strong> → Consumer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — RWA Tokenization */}
      <section className="info-section">
        <div className="info-section-number">02</div>
        <div className="info-section-body">
          <h3>Real-World Asset Tokenization (ETK)</h3>
          <div className="info-conversion-card">
            <div className="info-c-top">The Core Standard</div>
            <div className="info-c-main">
              <span className="big-unit">1 ETK</span>
              <span className="big-equal">=</span>
              <span className="big-unit">1 kWh</span>
            </div>
            <p>of physical renewable energy</p>
          </div>
          <p>
            To bring the physical energy grid onto the blockchain, EnerDEX uses <strong>RWA (Real-World Asset) Tokenization</strong>. We perfectly peg physical electricity to a digital asset.
          </p>
          <div className="info-story-box">
            <h4>📖 The Story of Alice & Bob</h4>
            <p>
              Imagine <strong>Alice</strong> has solar panels. Her panels generate 10 kWh of excess energy. A smart meter detects this and communicates with the blockchain via an Oracle, automatically "minting" <strong>10 ETK</strong> into Alice's MetaMask wallet.
            </p>
            <p>
              <strong>Bob</strong> needs energy to charge his electric car. He buys Alice's 10 ETK through our Marketplace smart contract. The contract guarantees <strong>Delivery vs. Payment</strong>: Bob's ETH is sent to Alice, and Alice's ETK is sent to Bob simultaneously.
            </p>
            <p>
              When Bob's car consumes the 10 kWh from the physical grid, his 10 ETK are "burned" (destroyed) on the blockchain. This process provides immutable proof of green energy consumption, a vital asset for corporate <strong>ESG compliance</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3 — Smart Contracts */}
      <section className="info-section">
        <div className="info-section-number">03</div>
        <div className="info-section-body">
          <h3>The Smart Contracts</h3>
          <p>
            EnerDEX uses <strong>two Solidity smart contracts</strong>, both deployed on the Ethereum
            network and verified using OpenZeppelin's audited libraries:
          </p>
          <div className="info-contracts-grid">
            <div className="info-contract-card">
              <div className="info-contract-icon">🪙</div>
              <h4>EToken.sol <span className="info-tag">ERC-20</span></h4>
              <p>
                An ERC-20 token representing <strong>1 kWh of energy</strong>. The contract owner
                (admin) can mint new tokens to simulate energy production. Tokens are fully
                transferable and tradeable.
              </p>
              <ul>
                <li>Standard: <code>ERC-20</code></li>
                <li>Symbol: <code>ETK</code></li>
                <li>1 ETK = 1 kWh</li>
                <li>Ownable: only admin can mint</li>
              </ul>
            </div>
            <div className="info-contract-card">
              <div className="info-contract-icon">🏪</div>
              <h4>EnergyMarketplace.sol <span className="info-tag">Escrow</span></h4>
              <p>
                The marketplace contract manages <strong>listings, trades, fees, and loyalty</strong>.
                It holds tokens in escrow during a sale, enforces payment, and distributes rewards.
              </p>
              <ul>
                <li>Escrow-based trading</li>
                <li>2% platform fee</li>
                <li>Loyalty points + discount system</li>
                <li>ReentrancyGuard protection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Transaction Lifecycle */}
      <section className="info-section">
        <div className="info-section-number">04</div>
        <div className="info-section-body">
          <h3>Transaction Lifecycle</h3>
          <p>Every energy trade follows this on-chain flow:</p>
          <div className="info-flow">
            <div className="info-flow-step">
              <div className="info-flow-num">1</div>
              <div className="info-flow-content">
                <strong>Seller lists energy</strong>
                <span>ETK tokens are transferred to the smart contract (escrow)</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">2</div>
              <div className="info-flow-content">
                <strong>Listing appears on marketplace</strong>
                <span>Anyone can see the amount and price on-chain</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">3</div>
              <div className="info-flow-content">
                <strong>Buyer purchases listing</strong>
                <span>Buyer sends exact ETH amount to the contract</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">4</div>
              <div className="info-flow-content">
                <strong>Atomic settlement</strong>
                <span>In a single transaction: ETK → buyer, ETH − fee → seller, +10 pts each</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Escrow Model */}
      <section className="info-section">
        <div className="info-section-number">05</div>
        <div className="info-section-body">
          <h3>The Escrow Model</h3>
          <p>
            When a seller lists energy, their ETK tokens are <strong>transferred into the smart
            contract</strong> — not held by any person or company. This is called <em>escrow</em>.
          </p>
          <div className="info-escrow-visual">
            <div className="info-escrow-party">
              <div className="info-escrow-icon">👤</div>
              <span>Seller</span>
            </div>
            <div className="info-escrow-arrow">
              ETK →
            </div>
            <div className="info-escrow-party center-party">
              <div className="info-escrow-icon">🔒</div>
              <span>Smart Contract<br />(Escrow)</span>
            </div>
            <div className="info-escrow-arrow">
              → ETK
            </div>
            <div className="info-escrow-party">
              <div className="info-escrow-icon">👤</div>
              <span>Buyer</span>
            </div>
          </div>
          <p style={{ marginTop: "1rem" }}>
            If the seller changes their mind, they can <strong>cancel the listing</strong> and
            the contract returns the tokens automatically. No trust required — the code enforces
            the rules.
          </p>
        </div>
      </section>

      {/* 6 — Fee & Loyalty */}
      <section className="info-section">
        <div className="info-section-number">06</div>
        <div className="info-section-body">
          <h3>Fee & Loyalty System</h3>
          <div className="info-fee-grid">
            <div className="info-fee-card">
              <h4>💸 Platform Fee</h4>
              <div className="info-fee-big">2%</div>
              <p>Deducted from each trade. Stored on-chain and withdrawable by the contract owner.</p>
            </div>
            <div className="info-fee-card">
              <h4>🏆 Loyalty Points</h4>
              <div className="info-fee-big">+10</div>
              <p>Both buyer and seller earn 10 points per trade. Points are stored permanently on the blockchain.</p>
            </div>
            <div className="info-fee-card">
              <h4>🥇 Max Discount</h4>
              <div className="info-fee-big">50%</div>
              <p>Gold tier (100+ points) — pay only 1% fee instead of 2%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Why Blockchain? */}
      <section className="info-section">
        <div className="info-section-number">07</div>
        <div className="info-section-body">
          <h3>Why Blockchain?</h3>
          <div className="info-why-grid">
            {[
              { icon: "🔒", title: "Trustless", desc: "No intermediary needed. The smart contract enforces all rules automatically." },
              { icon: "🔍", title: "Transparent", desc: "Every listing, trade, and fee is recorded on the public blockchain — anyone can verify." },
              { icon: "⚡", title: "Instant Settlement", desc: "Trades settle atomically in a single transaction — no T+2 delays." },
              { icon: "🛡️", title: "Censorship Resistant", desc: "No central authority can block trades, freeze funds, or change the rules." },
              { icon: "📊", title: "Auditable", desc: "Complete on-chain history. No hidden fees, no altered records." },
              { icon: "🌍", title: "Globally Accessible", desc: "Anyone with an Ethereum wallet can participate — no registration required." },
            ].map((item) => (
              <div key={item.title} className="info-why-card">
                <div className="info-why-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="info-cta">
        <h3>Ready to try it?</h3>
        <p>Connect your MetaMask wallet and start trading energy tokens.</p>
        <div className="info-cta-links">
          <Link to="/" className="btn-connect-large">🦊 Go to Dashboard</Link>
          <Link to="/architecture" className="btn-ghost" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
            🏗️ View Architecture →
          </Link>
        </div>
      </div>
    </div>
  );
}
