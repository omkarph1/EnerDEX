export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-col">
          <h3>Decentralized Energy Marketplace (EnerDEX)</h3>
          <p>
            A Blockchain Lab Project demonstrating peer-to-peer renewable energy trading using Ethereum Smart Contracts.
          </p>
        </div>

        <div className="footer-col">
          <h4>Team Members</h4>
          <ul>
            <li>Yasir Divde (Roll No. 4516)</li>
            <li>Omkar Phadtare (Roll No. 4565)</li>
            <li>Tanishq Sarang (Roll No. 4567)</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Institution</h4>
          <p><strong>Under the Guidance of:</strong> Prof. Hitendra A. Chavan</p>
          <p>Department of Information Technology</p>
          <p>Bharati Vidyapeeth College of Engineering, Navi Mumbai</p>
          <p>Academic Year 2025–2026</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EnerDEX Project Team. Open Source.</p>
      </div>
    </footer>
  );
}
