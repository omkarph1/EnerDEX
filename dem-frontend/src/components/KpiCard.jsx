export default function KpiCard({ icon, label, value, unit, highlight, highlightColor, className = "" }) {
  const cls = [
    "kpi-card",
    highlight ? "highlight" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} style={highlightColor ? { borderColor: highlightColor } : undefined}>
      <div className="kpi-icon" style={highlightColor ? { color: highlightColor } : undefined}>
        {icon}
      </div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={highlightColor ? { color: highlightColor } : undefined}>{value}</div>
        <div className="kpi-unit">{unit}</div>
      </div>
    </div>
  );
}
