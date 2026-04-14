import { Link } from "react-router-dom";

export default function Architecture() {
  return (
    <div className="info-page">
      {/* Hero */}
      <div className="info-hero">
        <span className="info-hero-icon">🏗️</span>
        <h2>System Architecture</h2>
        <p>Technical deep dive into how EnerDEX is designed, built, and secured.</p>
      </div>

      {/* 1 — System Overview */}
      <section className="info-section">
        <div className="info-section-number">01</div>
        <div className="info-section-body">
          <h3>System Overview</h3>
          <p>EnerDEX follows a classic Web3 dApp architecture. The frontend communicates with
             the Ethereum blockchain through MetaMask — there is <strong>no backend server</strong>.</p>
          <div className="arch-diagram">
            <div className="arch-layer">
              <div className="arch-label">Frontend Layer</div>
              <div className="arch-boxes">
                <div className="arch-box react">React 19 + Vite</div>
                <div className="arch-box ethers">ethers.js v6</div>
              </div>
            </div>
            <div className="arch-connector">▼ JSON-RPC calls</div>
            <div className="arch-layer">
              <div className="arch-label">Wallet Layer</div>
              <div className="arch-boxes">
                <div className="arch-box metamask">MetaMask Extension</div>
              </div>
            </div>
            <div className="arch-connector">▼ eth_sendTransaction</div>
            <div className="arch-layer">
              <div className="arch-label">Blockchain Layer</div>
              <div className="arch-boxes">
                <div className="arch-box sol">EToken.sol</div>
                <div className="arch-box sol">EnergyMarketplace.sol</div>
              </div>
            </div>
            <div className="arch-connector">▼ Persistent storage</div>
            <div className="arch-layer">
              <div className="arch-label">EVM State</div>
              <div className="arch-boxes">
                <div className="arch-box evm">Listings · Balances · Loyalty Points · Fees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Tech Stack */}
      <section className="info-section">
        <div className="info-section-number">02</div>
        <div className="info-section-body">
          <h3>Tech Stack</h3>
          <div className="arch-stack-grid">
            {[
              { cat: "Smart Contracts", items: [
                { name: "Solidity ^0.8.0", desc: "Contract programming language" },
                { name: "OpenZeppelin v5", desc: "Audited ERC-20, Ownable, ReentrancyGuard" },
                { name: "Hardhat", desc: "Development, compilation, and deployment framework" },
              ]},
              { cat: "Frontend", items: [
                { name: "React 19", desc: "UI component library" },
                { name: "Vite 8", desc: "Fast build tool with HMR" },
                { name: "ethers.js v6", desc: "Ethereum provider and contract interaction" },
                { name: "React Router v7", desc: "Client-side routing" },
              ]},
              { cat: "Infrastructure", items: [
                { name: "MetaMask", desc: "Browser wallet for transaction signing" },
                { name: "Hardhat Network", desc: "Local EVM for development and testing" },
                { name: "Node.js", desc: "Runtime for build tools and deployment scripts" },
              ]},
            ].map((group) => (
              <div key={group.cat} className="arch-stack-group">
                <h4>{group.cat}</h4>
                {group.items.map((item) => (
                  <div key={item.name} className="arch-stack-item">
                    <span className="arch-stack-name">{item.name}</span>
                    <span className="arch-stack-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Contract Design */}
      <section className="info-section">
        <div className="info-section-number">03</div>
        <div className="info-section-body">
          <h3>Contract Design Patterns</h3>
          <div className="arch-patterns">
            <div className="arch-pattern-card">
              <h4>🔄 Checks-Effects-Interactions</h4>
              <p>
                In <code>buyEnergy()</code>, the listing is marked inactive <strong>before</strong> any
                external transfers. This prevents reentrancy attacks where a malicious contract could
                re-enter the function during a callback.
              </p>
              <pre className="arch-code">
{`// 1. Check
require(listing.isActive);
require(msg.value == listing.priceWei);

// 2. Effect (state change FIRST)
listing.isActive = false;
collectedFees += fee;

// 3. Interaction (external call LAST)
energyToken.transfer(buyer, amount);
seller.call{value: sellerAmount}("");`}
              </pre>
            </div>
            <div className="arch-pattern-card">
              <h4>🔒 ReentrancyGuard</h4>
              <p>
                Both <code>buyEnergy()</code> and <code>withdrawFees()</code> use
                OpenZeppelin's <code>nonReentrant</code> modifier as a secondary defense layer.
              </p>
            </div>
            <div className="arch-pattern-card">
              <h4>🏛️ Ownable Access Control</h4>
              <p>
                Admin functions like <code>mint()</code> and <code>withdrawFees()</code>
                are restricted to the contract deployer using <code>Ownable</code>.
              </p>
            </div>
            <div className="arch-pattern-card">
              <h4>📦 Escrow Pattern</h4>
              <p>
                Sellers transfer tokens to the contract when listing. The contract holds
                them until purchase or cancellation — no trust required between parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Security */}
      <section className="info-section">
        <div className="info-section-number">04</div>
        <div className="info-section-body">
          <h3>Security Features</h3>
          <div className="arch-security-grid">
            {[
              { icon: "🛡️", title: "Reentrancy Protection",  desc: "OpenZeppelin ReentrancyGuard + CEI pattern on all payable functions." },
              { icon: "🔐", title: "Access Control",          desc: "onlyOwner modifier on minting and fee withdrawal functions." },
              { icon: "✅", title: "Input Validation",        desc: "All public functions validate inputs with require() statements." },
              { icon: "⚡", title: "Atomic Transactions",     desc: "Trades are all-or-nothing. If any step fails, the entire transaction reverts." },
              { icon: "📝", title: "Event Logging",           desc: "All state changes emit events for off-chain tracking and verification." },
              { icon: "🧱", title: "Immutable Code",          desc: "Once deployed, contract code cannot be altered — rules are permanent." },
            ].map((s) => (
              <div key={s.title} className="arch-security-card">
                <div className="arch-security-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Deployment */}
      <section className="info-section">
        <div className="info-section-number">05</div>
        <div className="info-section-body">
          <h3>Deployment Flow</h3>
          <p>The automated deployment script handles everything:</p>
          <div className="info-flow">
            <div className="info-flow-step">
              <div className="info-flow-num">1</div>
              <div className="info-flow-content">
                <strong>npx hardhat node</strong>
                <span>Starts a local EVM with 20 pre-funded accounts</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">2</div>
              <div className="info-flow-content">
                <strong>Deploy EToken.sol</strong>
                <span>Mints 1000 ETK to the deployer's address</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">3</div>
              <div className="info-flow-content">
                <strong>Deploy EnergyMarketplace.sol</strong>
                <span>Links to the EToken contract address</span>
              </div>
            </div>
            <div className="info-flow-arrow">↓</div>
            <div className="info-flow-step">
              <div className="info-flow-num">4</div>
              <div className="info-flow-content">
                <strong>Auto-update frontend</strong>
                <span>Writes config.js + copies ABI files to dem-frontend/src/contracts/</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — Stats */}
      <section className="info-section">
        <div className="info-section-number">06</div>
        <div className="info-section-body">
          <h3>Project Statistics</h3>
          <div className="arch-stats-grid">
            {[
              { label: "Smart Contracts",     value: "2",            desc: "EToken + EnergyMarketplace" },
              { label: "Solidity Functions",   value: "7",            desc: "listEnergy, buyEnergy, cancelListing, withdrawFees, getDiscount, getListing, mint" },
              { label: "On-chain Events",    value: "3",            desc: "EnergyListed, EnergyTraded, ListingCancelled" },
              { label: "OpenZeppelin Imports", value: "4",           desc: "ERC20, Ownable, ReentrancyGuard, Access" },
              { label: "Frontend Pages",      value: "7",            desc: "Dashboard, Market, History, Income, Loyalty, How It Works, Architecture" },
              { label: "React Components",    value: "7",           desc: "Header, TabNav, StatusBar, KpiCard, ListingCard, TxRow, EnergyForm" },
            ].map((s) => (
              <div key={s.label} className="arch-stat-card">
                <div className="arch-stat-value">{s.value}</div>
                <div className="arch-stat-label">{s.label}</div>
                <div className="arch-stat-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="info-cta">
        <h3>Explore the Application</h3>
        <p>See the smart contracts in action on the live marketplace.</p>
        <div className="info-cta-links">
          <Link to="/" className="btn-connect-large">⚡ Go to Dashboard</Link>
          <Link to="/how-it-works" className="btn-ghost" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
            📖 How It Works →
          </Link>
        </div>
      </div>
    </div>
  );
}
