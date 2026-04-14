import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/market",    icon: "🏪", label: "Market" },
  { to: "/history",   icon: "📜", label: "History" },
  { to: "/income",    icon: "💰", label: "Income" },
  { to: "/loyalty",   icon: "🏆", label: "Loyalty" },
];

export default function TabNav() {
  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
