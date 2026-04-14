import { Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import TabNav from "./components/TabNav";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import History from "./pages/History";
import Income from "./pages/Income";
import Loyalty from "./pages/Loyalty";
import HowItWorks from "./pages/HowItWorks";
import Architecture from "./pages/Architecture";
import Footer from "./components/Footer";
import "./App.css";

function AppRoutes() {
  const { account } = useWallet();

  return (
    <div className="app">
      <Header />

      <div className="main-layout">
        <StatusBar />
        {account && <TabNav />}

        <Routes>
          {/* Public pages — always accessible */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/architecture" element={<Architecture />} />

          {/* Authenticated pages */}
          <Route
            path="/"
            element={account ? <Navigate to="/dashboard" replace /> : <Landing />}
          />
          <Route
            path="/dashboard"
            element={account ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/market"
            element={account ? <Market /> : <Navigate to="/" replace />}
          />
          <Route
            path="/history"
            element={account ? <History /> : <Navigate to="/" replace />}
          />
          <Route
            path="/income"
            element={account ? <Income /> : <Navigate to="/" replace />}
          />
          <Route
            path="/loyalty"
            element={account ? <Loyalty /> : <Navigate to="/" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppRoutes />
    </WalletProvider>
  );
}

export default App;