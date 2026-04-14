import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { shortAddr, loyaltyTier } from "../utils/helpers";

export default function Header() {
  const {
    account, connectWallet, switchAccount, disconnectWallet,
    ethBalance, etkBalance, loyaltyPoints, discount, isOwner,
  } = useWallet();
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("enerdex_theme") || "dark");
  const location = useLocation();
  const tier = loyaltyTier(loyaltyPoints);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("enerdex_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  return (
    <header className="header" onClick={() => showMenu && setShowMenu(false)}>
      <Link to="/" className="header-brand" style={{ textDecoration: "none" }}>
        <div className="header-logo">⚡</div>
        <div className="header-brand-text">
          <h1>EnerDEX</h1>
          <span className="header-sub">Decentralized Energy Marketplace</span>
        </div>
      </Link>

      <div className="header-links">
        <Link
          to="/how-it-works"
          className={`header-link ${location.pathname === "/how-it-works" ? "active" : ""}`}
        >
          📖 How It Works
        </Link>
        <Link
          to="/architecture"
          className={`header-link ${location.pathname === "/architecture" ? "active" : ""}`}
        >
          🏗️ Architecture
        </Link>
      </div>

      <div className="header-actions" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          style={{ 
            background: "transparent", 
            fontSize: "1.2rem", 
            padding: "0.5rem", 
            borderRadius: "50%", 
            transition: "background 0.2s" 
          }}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {!account ? (
          <button className="btn-connect" onClick={connectWallet}>🦊 Connect MetaMask</button>
        ) : (
          <div className="wallet-dropdown" onClick={(e) => e.stopPropagation()}>
            <button className="wallet-pill" onClick={() => setShowMenu(!showMenu)}>
              <span className="wallet-dot" />
              {shortAddr(account)} ▾
            </button>

            {showMenu && (
              <div className="wallet-menu">
                <div className="wallet-menu-top">
                  <div
                    className="wallet-menu-addr"
                    onClick={() => copyToClipboard(account)}
                    title="Click to copy"
                  >
                    📍 {account.slice(0, 12)}…{account.slice(-6)} 📋
                  </div>
                  <div className="wallet-menu-balances">
                    <span>💰 {ethBalance} ETH</span>
                    <span>⚡ {etkBalance} ETK</span>
                  </div>
                  <div className="wallet-menu-tier" style={{ color: tier.color }}>
                    {tier.label} · {loyaltyPoints} pts · {discount}% off
                  </div>
                </div>
                <button className="wallet-menu-item" onClick={switchAccount}>🔄 Switch Account</button>
                <Link className="wallet-menu-item" to="/income" onClick={() => setShowMenu(false)}>💰 My Income</Link>
                <Link className="wallet-menu-item" to="/loyalty" onClick={() => setShowMenu(false)}>🏆 Loyalty Program</Link>
                {isOwner && (
                  <Link className="wallet-menu-item owner" to="/income" onClick={() => setShowMenu(false)}>
                    👑 Admin Panel
                  </Link>
                )}
                <button className="wallet-menu-item disconnect" onClick={() => { setShowMenu(false); disconnectWallet(); }}>
                  🔌 Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
