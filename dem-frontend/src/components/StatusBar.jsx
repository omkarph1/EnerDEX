import { useWallet } from "../context/WalletContext";

export default function StatusBar() {
  const { status, statusType } = useWallet();
  const { showStatus } = useWallet();
  if (!status) return null;

  return (
    <div className={`status-bar status-${statusType}`}>
      {status}
      <button className="status-close" onClick={() => showStatus("", "info")}>×</button>
    </div>
  );
}
