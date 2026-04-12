# EnerDEX Full Project Report 

## 1) Executive Summary
EnerDEX is a full-stack decentralized energy marketplace with two coordinated codebases:
- `dem-project` (Hardhat + Solidity smart contracts)
- `dem-frontend` (React + Vite + Ethers dApp)

Users trade ETK (energy-token units), while the marketplace enforces escrow, fees, and loyalty discount rules on-chain.

## 2) Current Architecture

### 2.1 Blockchain Layer (`dem-project`)
- `EToken.sol`: ERC20 token (`EnergyToken`, symbol `ETK`) with owner-only minting
- `EnergyMarketplace.sol`: listing, escrow, purchase, fee collection, loyalty points
- `SimpleStorage.sol`: independent basic sample contract
- Hardhat tests cover token and marketplace paths

### 2.2 Frontend Layer (`dem-frontend`)
- Wallet-based dApp UI around MetaMask
- Contract reads: balances, listings, loyalty points, collected fees
- Contract writes: list, buy, cancel, mint, withdraw fees
- Event-based history and seller income analytics

### 2.3 Integration Layer (Updated)
Latest workflow improvement in current codebase:
- Deploy script auto-copies ABIs to frontend:
	- `dem-frontend/src/contracts/EToken.json`
	- `dem-frontend/src/contracts/EnergyMarketplace.json`
- Deploy script auto-writes frontend environment file:
	- `dem-frontend/.env`
- Frontend address config now resolves from env vars in `src/contracts/config.js`

This replaced the older manual address-edit pattern.

## 3) Business Flow Trace

### 3.1 Listing
1. Seller enters ETK amount and ETH price in frontend.
2. Frontend submits `approve(marketplace, amountInBaseUnits)`.
3. Frontend calls `listEnergy(amountETK, priceWei)`.
4. Contract escrows `amountETK * 10^18` token units.

### 3.2 Purchase
1. Buyer chooses active listing.
2. Frontend calls `buyEnergy(listingId)` with exact ETH value.
3. Contract validates listing and computes fee with discount.
4. Contract transfers ETK to buyer and ETH-minus-fee to seller.
5. Both buyer and seller receive loyalty points.

### 3.3 History and Analytics
1. Frontend queries `EnergyListed` and `EnergyTraded` events.
2. Events are merged and sorted by block.
3. Seller income summary is computed from trade events.

## 4) Verified Change Set in Latest Commit

Latest commit updates project behavior in these files:
- `dem-frontend/src/contracts/config.js`
- `dem-project/hardhat.config.js`
- `dem-project/package.json`
- `dem-project/scripts/deployMarketplace.js`
- `dem-frontend/.gitignore`

Key outcomes:
- standardized npm script commands in smart-contract project
- localhost network settings confirmed in Hardhat config
- deployment now auto-syncs frontend ABI + address environment
- frontend `.env` intentionally ignored by git

## 5) Command Reference (Current)

### 5.1 Smart contracts (`dem-project`)

```bash
cd dem-project
npm install
npm run compile
npm test
npm run node
npm run deploy
```

### 5.2 Frontend (`dem-frontend`)

```bash
cd dem-frontend
npm install
npm run dev
npm run build
npm run lint
```

## 6) End-to-End Local Runbook

1. Terminal A:

```bash
cd dem-project
npm run node
```

2. Terminal B:

```bash
cd dem-project
npm run deploy
```

3. Terminal C:

```bash
cd dem-frontend
npm run dev
```

4. In browser:
- connect MetaMask to localhost
- switch to funded test account
- perform mint/list/buy/cancel scenarios

## 7) Unit Convention and Operational Caveat

`EToken.mint(to, amount)` multiplies by decimals internally.

That means callers should pass human units (example: `500`), not pre-scaled `10^18` values. Frontend mint flow currently follows this convention.

## 8) Quality Snapshot

### Strengths
- Complete full-stack architecture with clear layer separation
- Practical marketplace logic with fee/loyalty mechanism
- Working Hardhat tests for token and marketplace rules
- Improved deploy-to-frontend automation

### Risks / Next Improvements
- `App.jsx` remains monolithic and would benefit from component split
- querying events from block 0 may become expensive on long-lived networks
- no frontend automated test suite yet
- marketplace has no explicit reentrancy guard modifier (state-updates-first ordering is used)

## 9) Conclusion
BLC currently stands as a functioning end-to-end prototype of decentralized energy trading with improved deployment ergonomics, cleaner contract/frontend synchronization, and reproducible local developer workflow.
