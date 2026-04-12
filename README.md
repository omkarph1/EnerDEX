# ⚡ EnerDEX — Decentralized Energy Marketplace

<div align="center">

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.28-f7d716?style=for-the-badge&logo=ethereum&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)

**A full-stack Web3 dApp for peer-to-peer renewable energy trading.**  
No middlemen. No banks. Just you, your neighbor, and the blockchain.

</div>

---

## 📌 What Is EnerDEX?

EnerDEX is a decentralized energy marketplace where users can **buy and sell renewable energy units (ETK tokens)** directly with each other using Ethereum smart contracts.

- **1 ETK = 1 kWh** of renewable energy
- Energy listings are **escrow-protected** — tokens are locked until a buyer pays
- Platform fees are **automatically calculated** with loyalty discounts
- All transaction history is **stored on-chain** — transparent and tamper-proof

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Wallet Connect** | Connect, switch, and disconnect MetaMask accounts |
| ⚡ **List Energy** | Lock ETK in escrow and list for sale at your chosen ETH price |
| 🛒 **Buy Energy** | Purchase listed ETK with exact ETH — automatic transfer via smart contract |
| ❌ **Cancel Listing** | Reclaim your ETK from escrow at any time |
| 🏆 **Loyalty Rewards** | Earn +10 points per trade — unlock fee discounts automatically |
| 💰 **Income Tracking** | View total ETH earned, trades completed, and ETK sold |
| 📜 **Transaction History** | Full on-chain event log of all buys, sells, and listings |
| 👑 **Admin Panel** | Mint new ETK tokens and withdraw accumulated platform fees |
| 🎁 **Fee Discounts** | Bronze 10% → Silver 25% → Gold 50% off platform fee |

---

## 🏗️ Project Structure

```
EnerDEX/
├── dem-project/                       ← Blockchain layer
│   ├── contracts/
│   │   ├── EToken.sol                 ← ERC-20 energy token (ETK)
│   │   ├── EnergyMarketplace.sol      ← Escrow + fees + loyalty logic
│   │   └── SimpleStorage.sol          ← Sample contract (demo only)
│   ├── scripts/
│   │   ├── deployMarketplace.js       ← Deploy + auto-sync frontend (primary)
│   │   ├── deployToken.js             ← Deploy EToken only
│   │   └── deploy.js                  ← Deploy SimpleStorage only
│   ├── test/
│   │   ├── EToken.test.js
│   │   └── EnergyMarketplace.test.js
│   └── hardhat.config.js
│
├── dem-frontend/                      ← React frontend
│   └── src/
│       ├── App.jsx                    ← Main dApp UI (5 tabs)
│       ├── App.css                    ← Dark theme styles
│       └── contracts/
│           ├── config.js              ← Reads addresses from .env
│           ├── EToken.json            ← ABI (auto-copied on deploy)
│           └── EnergyMarketplace.json ← ABI (auto-copied on deploy)
│
├── REPORT_EnerDEX_FULL.md             ← Full technical report
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) browser extension
- npm

### Step 1 — Install Dependencies

```bash
# Blockchain layer
cd dem-project
npm install

# Frontend layer
cd ../dem-frontend
npm install
```

### Step 2 — Start Local Blockchain

```bash
cd dem-project
npm run node
```

⏳ Wait until you see **20 accounts with private keys** printed in the terminal. Keep this terminal running.

### Step 3 — Deploy Contracts & Auto-Sync Frontend

Open a **new terminal**:

```bash
cd dem-project
npm run deploy
```

Expected output:

```
✅ EToken deployed to: 0x...
✅ EnergyMarketplace deployed to: 0x...
✅ Minted 500 ETK to seller: 0x...
✅ ABIs copied to dem-frontend/src/contracts/
✅ .env written to dem-frontend/

══════════════════════════════════════════════════════
🎉 DEPLOYMENT COMPLETE — Frontend auto-synced!
══════════════════════════════════════════════════════
```

### Step 4 — Start Frontend

Open another **new terminal**:

```bash
cd dem-frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 5 — Setup MetaMask

1. Add **Hardhat Local** network to MetaMask:

   | Field | Value |
   |---|---|
   | Network Name | `Hardhat Local` |
   | RPC URL | `http://127.0.0.1:8545` |
   | Chain ID | `31337` |
   | Currency Symbol | `ETH` |

2. Import test accounts using the private keys printed by the node terminal:
   - **Account #0** → Admin (contract owner, can mint and withdraw fees)
   - **Account #1** → Test Seller (pre-funded with 500 ETK)
   - **Any other account** → Test Buyer

3. Connect MetaMask on `http://localhost:5173` and start trading.

---

## 🔄 How It Works

### Listing Flow

```
Seller → Approve ETK → listEnergy() → ETK locked in escrow → Listing appears on Market
```

### Purchase Flow

```
Buyer → buyEnergy() + ETH → Contract validates price → Fee deducted → ETK to buyer + ETH to seller → +10 loyalty points each
```

### Cancel Flow

```
Seller → cancelListing() → ETK returned from escrow → Listing deactivated
```

### Fee & Discount System

```
Platform fee: 2% of trade price

Loyalty Tiers:
  ⭐ Starter  (0–9 pts)    → 0% discount  → pay full 2%
  🥉 Bronze   (10–49 pts)  → 10% discount → pay 1.8%
  🥈 Silver   (50–99 pts)  → 25% discount → pay 1.5%
  🥇 Gold     (100+ pts)   → 50% discount → pay 1.0%
```

---

## 🧪 Running Tests

```bash
cd dem-project
npm test
```

### Test Coverage

| # | Test | What It Verifies |
|---|---|---|
| 1 | Initial token supply | Deployer receives 1000 ETK on deployment |
| 2 | Token metadata | Name is `EnergyToken`, symbol is `ETK` |
| 3 | Owner mint | `mint()` correctly increases recipient balance |
| 4 | Non-owner mint | Reverts when called by non-owner |
| 5 | List energy | ETK locked in escrow; listing marked active |
| 6 | Buy energy | ETK transferred to buyer, ETH to seller |
| 7 | Fee deduction | Exactly 2% fee collected in `collectedFees` |
| 8 | Loyalty points | +10 pts awarded to both buyer and seller |
| 9 | Loyalty discount | Reduced fee applied once buyer has ≥ 10 pts |
| 10 | Cancel listing | ETK returned to seller; listing deactivated |
| 11 | Revert: inactive listing | `buyEnergy` reverts on inactive listing |
| 12 | Revert: self-buy | Seller cannot purchase their own listing |
| 13 | Revert: wrong ETH | Reverts if sent ETH ≠ listing price |
| 14 | Fee withdrawal | Owner withdraws full fee balance; resets to zero |

---

## 🛠️ Tech Stack

### Blockchain

| Tool | Version | Purpose |
|---|---|---|
| Solidity | 0.8.28 | Smart contract language |
| Hardhat | ^2.28.6 | Development, testing, and deployment framework |
| OpenZeppelin | ^5.6.1 | ERC-20 + Ownable base contracts |
| Ethers.js | v6 | Blockchain interaction |

### Frontend

| Tool | Version | Purpose |
|---|---|---|
| React | ^19.2.4 | UI component framework |
| Vite | ^8.0.4 | Build tool and dev server |
| Ethers.js | ^6.16.0 | Contract calls from browser |
| ESLint | ^9.39.4 | Code linting (flat config) |
| MetaMask | — | Wallet provider (`window.ethereum`) |

---

## 📋 Available Scripts

### dem-project

```bash
npm run node      # Start local Hardhat blockchain node
npm run deploy    # Deploy contracts + auto-sync frontend ABIs and .env
npm run compile   # Compile all Solidity contracts
npm test          # Run all Hardhat tests
```

### dem-frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Build production bundle
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## ⚠️ Important Notes

- **Local only** — this project currently runs on the Hardhat local network only
- **Test accounts only** — Hardhat private keys are publicly known; never use them with real ETH
- **`.env` is gitignored** — contract addresses are auto-generated on each deploy and must not be committed
- **On redeploy:** restart the Vite dev server so the new addresses in `.env` are picked up
- **MetaMask nonce reset** — if you redeploy, go to MetaMask → Settings → Advanced → Clear activity tab data to avoid nonce mismatch errors

---

## 📄 Documentation

| File | Description |
|---|---|
| [`REPORT_EnerDEX_FULL.md`](./REPORT_EnerDEX_FULL.md) | Full end-to-end technical report |
| [`dem-project/README.md`](./dem-project/README.md) | Smart contract package documentation |
| [`dem-project/REPORT_DEM_PROJECT.md`](./dem-project/REPORT_DEM_PROJECT.md) | Detailed contract engineering report |
| [`dem-frontend/README.md`](./dem-frontend/README.md) | Frontend package documentation |
| [`dem-frontend/REPORT_DEM_FRONTEND.md`](./dem-frontend/REPORT_DEM_FRONTEND.md) | Detailed frontend architecture report |

---

## 📜 License

Licensed under the [Apache License 2.0](LICENSE).

---

<div align="center">

Built with ⚡ using Solidity · React · Hardhat · Ethers.js

</div>
