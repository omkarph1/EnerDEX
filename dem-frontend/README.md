# 🖥️ dem-frontend — React dApp Interface

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ethers](https://img.shields.io/badge/Ethers.js-v6-3C3C3D?style=for-the-badge&logo=ethereum)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)

**The user-facing dApp for EnerDEX.**  
MetaMask wallet integration · live on-chain data · full trading interface.

</div>

---

## 📌 What Is This Package?

`dem-frontend` is the browser-based decentralised application (dApp) for EnerDEX. It connects to the `EToken` and `EnergyMarketplace` smart contracts via MetaMask and provides:

- Real-time wallet balance and loyalty status
- Full energy listing, buying, and cancellation flows
- On-chain event-driven transaction history and seller income analytics
- Owner admin panel for minting tokens and withdrawing platform fees

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | `^19.2.4` | UI component framework |
| Vite | `^8.0.4` | Build tool and dev server |
| Ethers.js | `^6.16.0` | Ethereum provider and contract interaction |
| ESLint | `^9.39.4` | Static code analysis (flat config) |
| MetaMask | — | Wallet provider via `window.ethereum` |

---

## 🏗️ Project Structure

```
dem-frontend/
├── src/
│   ├── components/                   ← Reusable UI components
│   ├── context/                      ← React Context (WalletContext)
│   ├── pages/                        ← App pages/tabs
│   ├── utils/                        ← Helper functions
│   ├── App.jsx                       ← Main App router
│   ├── App.css                       ← Complete dual theme styling layer (Dark/Light)
│   ├── main.jsx                      ← React DOM entry point
│   ├── index.css                     ← Global base styles
│   └── contracts/
│       ├── config.js                 ← Reads VITE_* addresses from .env
│       ├── EToken.json               ← Token ABI (auto-copied on deploy)
│       └── EnergyMarketplace.json    ← Marketplace ABI (auto-copied on deploy)
├── public/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── .env                              ← Contract addresses (auto-generated, gitignored)
```

---

## ✨ UI Features

| Tab / Section | What It Does |
|---|---|
| 🏠 **Dashboard** | ETH balance, ETK balance, loyalty tier, fee discount, collected fees |
| ⚡ **Market** | Browse active listings, list your own energy, buy or cancel listings |
| 📜 **History** | Full on-chain log of all `EnergyListed` and `EnergyTraded` events |
| 💰 **Income** | Seller income summary — total ETH earned, ETK sold, trades completed |
| 🏆 **Loyalty** | Current points balance and tier progress |
| 👑 **Admin Panel** | Mint new ETK to any address; withdraw all collected platform fees (owner only) |

---

## ⚙️ Address Configuration

`src/contracts/config.js` reads deployed contract addresses from Vite environment variables:

```js
export const ETOKEN_ADDRESS      = import.meta.env.VITE_ETOKEN_ADDRESS;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
```

`dem-frontend/.env` is written automatically by the deploy script in `dem-project`:

```
VITE_ETOKEN_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

> **⚠️ Note:** `.env` is gitignored and must never be committed. It is regenerated every time you run `npm run deploy` in `dem-project`. Restart the Vite dev server after redeploying to pick up the new addresses.

---

## 🚀 Setup and Local Workflow

### Prerequisites

- MetaMask browser extension installed
- `dem-project` node running and contracts deployed

### Step 1 — Deploy contracts first (from `dem-project`)

```bash
# Terminal A — start blockchain node
cd ../dem-project
npm run node

# Terminal B — deploy and auto-sync this frontend
cd ../dem-project
npm run deploy
```

This writes `.env` and copies ABI files into `src/contracts/` automatically.

### Step 2 — Install and start the dev server

```bash
cd dem-frontend
npm install
npm run dev
```

Open `http://localhost:5173`, connect MetaMask to **Localhost 8545** (Chain ID `31337`), and import a Hardhat test account.

> - **Account #0** — Admin (contract owner)  
> - **Account #1** — Test Seller (pre-funded with 500 ETK)  
> - **Any other account** — Test Buyer

---

## 📋 npm Scripts

```bash
npm run dev       # Start Vite development server with hot module replacement
npm run build     # Compile and bundle for production
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

---

## 🔄 Contract Interaction Summary

### Read Operations — `loadData()`

Called on wallet connection and after every write transaction to keep the UI in sync.

| Data | Source |
|---|---|
| ETH balance | `provider.getBalance(account)` |
| ETK balance | `EToken.balanceOf(account)` |
| Loyalty points | `EnergyMarketplace.loyaltyPoints(account)` |
| Fee discount | `EnergyMarketplace.getDiscount(account)` |
| Is owner | `EToken.owner() === account` |
| Collected fees | `EnergyMarketplace.collectedFees()` |
| Active listings | Loop `getListing(i)` for `i` in `[0, listingCount)` |

### Event Queries — `loadHistory()`

| Event | What It Captures |
|---|---|
| `EnergyListed` | Every listing ever created |
| `EnergyTraded` | Every completed purchase |

Events are fetched from block `0`, merged, and sorted by timestamp for human-readable dates. Seller income is computed from `EnergyTraded` events where the connected account is the seller.

### Write Operations

| Function | Steps |
|---|---|
| `listEnergy()` | `EToken.approve(marketplace, parseUnits(amount, 18))` → `listEnergy(amountETK, priceWei)` |
| `buyEnergy(id)` | `buyEnergy(id, { value: listing.priceWei })` |
| `cancelListing(id)` | `cancelListing(id)` |
| `withdrawFees()` | `withdrawFees()` — owner only |
| `mintTokens()` | `EToken.mint(address, amount)` — owner only; passes human units |

All write calls go through a central `getContracts()` helper that constructs signer-connected contract instances:

```js
const provider = new BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();
const etoken   = new Contract(ETOKEN_ADDRESS, ETokenABI, signer);
const market   = new Contract(MARKETPLACE_ADDRESS, MarketplaceABI, signer);
```

---

## 🔢 Unit & Conversion Conventions

| Operation | Convention |
|---|---|
| Display ETK balance | `formatUnits(rawBalance, 18)` |
| Approve ETK for listing | `parseUnits(sellAmount, 18)` — converts to base units for the ERC-20 `approve` call |
| `listEnergy()` call | Human units (e.g. `50`) — marketplace contract scales internally |
| `mintTokens()` call | Human units (e.g. `500`) — EToken contract scales internally |

> **Important:** Only `approve` receives a base-unit scaled value. `listEnergy` and `mint` both take human-readable units — the contracts handle scaling.

---

## 🎨 UI Behaviour

- **Disconnected state** — Welcome screen with a prominent connect-wallet button
- **Tabbed navigation** — Dashboard · Market · History · Income · Loyalty
- **Transaction status** — Inline notifications track each transaction from submission → confirmation or failure
- **Owner admin panel** — Rendered only when the connected account matches `EToken.owner()` on-chain
- **Copy helpers** — One-click copy for wallet addresses and transaction hashes

---

## ⚠️ Important Notes

- ABI files in `src/contracts/` are auto-generated by the deploy script — do **not** edit them manually
- If contracts are redeployed, restart the dev server so the updated `.env` is picked up by Vite
- History queries start from block `0`, which is fine for local and demo chains; this needs optimisation for production networks
- The dApp currently supports MetaMask only (`window.ethereum`); multi-wallet support would require a library like wagmi or Web3Modal

---

## 📄 Documentation

| File | Description |
|---|---|
| [`REPORT_DEM_FRONTEND.md`](./REPORT_DEM_FRONTEND.md) | Detailed frontend architecture report |
| [`../REPORT_EnerDEX_FULL.md`](../REPORT_EnerDEX_FULL.md) | Full project technical report |
| [`../dem-project/README.md`](../dem-project/README.md) | Smart contract package documentation |
| [`../README.md`](../README.md) | Root project overview and quick start |

---

<div align="center">

Part of the [EnerDEX](../README.md) monorepo · Built with React + Vite + Ethers.js

</div>
