# 🔗 dem-project — Smart Contract Backend

<div align="center">

![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.28-f7d716?style=for-the-badge&logo=ethereum&logoColor=black)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.6-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)

**Hardhat workspace containing all on-chain logic for EnerDEX.**  
Smart contracts · deployment scripts · full test suite.

</div>

---

## 📌 What Is This Package?

`dem-project` is the blockchain layer of EnerDEX. It contains:

- The **ERC-20 energy token** (`EToken`) — represents kWh units as tradeable tokens
- The **escrow marketplace** (`EnergyMarketplace`) — handles listing, buying, cancelling, fees, and loyalty rewards
- **Deployment scripts** that compile, deploy, and automatically sync the frontend
- A **Hardhat test suite** covering all critical contract paths

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Solidity | `0.8.28` | Smart contract language |
| Hardhat | `^2.28.6` | Compile, test, deploy, and run local node |
| OpenZeppelin Contracts | `^5.6.1` | ERC-20 and Ownable base implementations |
| Hardhat Toolbox | `^6.1.2` | Bundles Ethers.js, Chai, coverage, and typechain |
| Node.js | `18+` | Runtime |

---

## 🏗️ Project Structure

```
dem-project/
├── contracts/
│   ├── EToken.sol               ← ERC-20 energy token (ETK)
│   └── EnergyMarketplace.sol    ← Escrow + fees + loyalty discount logic
├── scripts/
│   ├── deployMarketplace.js     ← Primary: deploy + auto-sync frontend
│   ├── deployToken.js           ← Deploy EToken only
│   └── deploy.js                ← Simple deploy script
├── test/
│   ├── EToken.test.js
│   └── EnergyMarketplace.test.js
├── artifacts/                   ← Compiled output (gitignored)
├── cache/                       ← Build cache (gitignored)
├── hardhat.config.js
└── package.json
```

---

## 📄 Contracts

### `EToken.sol` — ERC-20 Energy Token

| Property | Value |
|---|---|
| Token Name | `EnergyToken` |
| Symbol | `ETK` |
| Decimals | `18` |
| Initial Supply | `1000 ETK` minted to deployer on construction |
| Minting | Owner-only via `mint(address, amount)` |

> **⚠️ Unit convention:** `mint()` accepts **human-readable units** (e.g. `500`).  
> The contract multiplies by `10^18` internally — do **not** pre-scale the value yourself.

---

### `EnergyMarketplace.sol` — Escrow Marketplace

#### Constants

| Constant | Value | Description |
|---|---|---|
| `FEE_PERCENT` | `2` | Platform fee: 2% of every trade |
| `POINTS_PER_TRADE` | `10` | Loyalty points awarded to buyer and seller per trade |

#### Key State

| Variable | Type | Description |
|---|---|---|
| `energyToken` | `EToken` | Reference to the deployed EToken contract |
| `listings` | `mapping(uint256 → Listing)` | All listings indexed by ID |
| `listingCount` | `uint256` | Total listings ever created (next listing ID) |
| `loyaltyPoints` | `mapping(address → uint256)` | Points balance per address |
| `collectedFees` | `uint256` | Accumulated platform fees in wei |

#### Public Functions

| Function | Access | Description |
|---|---|---|
| `listEnergy(amountETK, priceWei)` | External | Escrows ETK; creates an active listing |
| `buyEnergy(listingId)` | External payable | Purchases listing; applies discount; settles ETK + ETH |
| `cancelListing(listingId)` | External | Seller cancels and reclaims escrowed ETK |
| `withdrawFees()` | Owner only | Transfers all collected fees to the owner |
| `getDiscount(address)` | Public view | Returns the caller's current fee discount percentage |
| `getListing(listingId)` | External view | Returns full listing details |

#### Loyalty Discount Tiers

| Tier | Points Required | Fee Discount | Effective Fee |
|---|---|---|---|
| ⭐ Starter | 0 – 9 | 0% | 2.0% |
| 🥉 Bronze | 10 – 49 | 10% | 1.8% |
| 🥈 Silver | 50 – 99 | 25% | 1.5% |
| 🥇 Gold | 100+ | 50% | 1.0% |

#### Events

| Event | Emitted By | Parameters |
|---|---|---|
| `EnergyListed` | `listEnergy` | `listingId, seller, amountETK, priceWei` |
| `EnergyTraded` | `buyEnergy` | `listingId, buyer, seller, amountETK, priceWei` |
| `ListingCancelled` | `cancelListing` | `listingId` |

#### Security Design

`buyEnergy` follows the **checks-effects-interactions** pattern:

```
1. CHECKS  → require: listing active, buyer ≠ seller, msg.value == priceWei
2. EFFECTS → listing.isActive = false; collectedFees += fee
3. INTERACT → transfer ETK to buyer; transfer ETH to seller
```

State is always updated **before** any external calls — preventing reentrancy without a separate modifier.

---



## 📜 Scripts

### Primary — `deployMarketplace.js`

Run with: `npm run deploy`

Performs the full end-to-end setup in one command:

```
Step 1 → Deploy EToken
Step 2 → Deploy EnergyMarketplace (passing EToken address)
Step 3 → Mint 500 ETK to signers[1]  (test seller account)
Step 4 → Copy EToken.json + EnergyMarketplace.json → dem-frontend/src/contracts/
Step 5 → Write VITE_ETOKEN_ADDRESS + VITE_MARKETPLACE_ADDRESS → dem-frontend/.env
```

Expected output:

```
✅ EToken deployed to: 0x...
✅ EnergyMarketplace deployed to: 0x...
✅ Minted 500 ETK to seller: 0x...
✅ ABIs copied to dem-frontend/src/contracts/
✅ .env written to dem-frontend/

🎉 DEPLOYMENT COMPLETE — Frontend auto-synced!
```

### Other Scripts

| Script | Description |
|---|---|
| `deployToken.js` | Deploy `EToken` only — useful for isolated token testing |

---

## 📋 npm Scripts

```bash
npm run compile   # Compile all Solidity contracts
npm test          # Run the full Hardhat test suite
npm run node      # Start a local Hardhat blockchain node (http://127.0.0.1:8545)
npm run deploy    # Deploy contracts and auto-sync dem-frontend
```

---

## 🚀 Quick Start

```bash
cd dem-project
npm install
npm run compile
npm test
```

To start the local blockchain and deploy:

```bash
# Terminal A — keep running
npm run node

# Terminal B
npm run deploy
```

---

## 🧪 Test Coverage

### `EToken.test.js`

| # | Test | What It Verifies |
|---|---|---|
| 1 | Initial supply | Deployer receives exactly 1000 ETK on deployment |
| 2 | Token metadata | Name is `EnergyToken`, symbol is `ETK` |
| 3 | Owner mint | `mint()` correctly increases recipient's balance |
| 4 | Non-owner mint | Call from non-owner address reverts |

### `EnergyMarketplace.test.js`

| # | Test | What It Verifies |
|---|---|---|
| 1 | Listing creation | ETK escrowed; listing stored with correct fields and active flag |
| 2 | Buy — ETK transfer | Buyer receives correct ETK amount |
| 3 | Buy — ETH transfer | Seller receives `priceWei − fee` |
| 4 | Fee accounting | `collectedFees` increases by the correct fee amount |
| 5 | Loyalty accrual | Buyer and seller each gain 10 points after a trade |
| 6 | Discount application | Reduced fee applied when buyer has ≥ 10 points |
| 7 | Cancel listing | Seller receives ETK back; listing deactivated |
| 8 | Revert: inactive listing | `buyEnergy` reverts if listing is already inactive |
| 9 | Revert: self-buy | Seller cannot purchase their own listing |
| 10 | Revert: wrong ETH | Sending incorrect ETH amount reverts |
| 11 | Fee withdrawal | Transfers full fee balance to owner; resets `collectedFees` to zero |

---

## ⚙️ Hardhat Configuration

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 60000,
    },
  },
};
```

---

## ⚠️ Important Notes

- Always start `npm run node` **before** running `npm run deploy`
- ABI files in `artifacts/` are compiler output — do not edit them manually
- The ABI copies in `dem-frontend/src/contracts/` are written by the deploy script — do not edit them manually
- Running `npm run deploy` on a fresh node regenerates all addresses; restart the frontend dev server afterwards

---

## 📄 Documentation

| File | Description |
|---|---|
| [`REPORT_DEM_PROJECT.md`](./REPORT_DEM_PROJECT.md) | Detailed contract engineering report |
| [`../REPORT_EnerDEX_FULL.md`](../REPORT_EnerDEX_FULL.md) | Full project technical report |
| [`../README.md`](../README.md) | Root project overview and quick start |

---

<div align="center">

Part of the [EnerDEX](../README.md) monorepo · Built with Solidity + Hardhat + OpenZeppelin

</div>
