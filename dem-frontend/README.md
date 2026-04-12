# dem-frontend

React + Vite frontend for the BLC decentralized energy marketplace.

This app connects to the deployed smart contracts and provides:
- wallet connection and account switching
- ETK/ETH balance dashboard
- list, buy, and cancel energy listings
- on-chain history and seller income stats
- loyalty points and fee discount views
- owner-only admin actions (mint ETK, withdraw fees)

## Tech Stack

- React 19
- Vite 8
- Ethers v6
- Plain CSS (custom theme in App.css)

## Folder Highlights

- src/App.jsx: main dApp logic and UI
- src/App.css: full styling system
- src/contracts/EToken.json: token ABI
- src/contracts/EnergyMarketplace.json: marketplace ABI
- src/contracts/config.js: deployed contract addresses

## Prerequisites

- Node.js 18+
- npm
- MetaMask browser extension
- Running blockchain network with deployed contracts (usually local Hardhat)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Ensure contract ABIs are present in src/contracts:
- EToken.json
- EnergyMarketplace.json

3. Set deployed addresses in src/contracts/config.js:

```js
export const ETOKEN_ADDRESS = "<deployed-token-address>";
export const MARKETPLACE_ADDRESS = "<deployed-marketplace-address>";
```

4. Start dev server:

```bash
npm run dev
```

## Scripts

- npm run dev: start local dev server
- npm run build: production build
- npm run preview: preview built app
- npm run lint: run ESLint

## Contract Interaction Flow

### Read flow
- loadData reads ETH balance, ETK balance, loyalty points, discount, fees, and active listings.
- loadHistory reads EnergyListed and EnergyTraded events.

### Write flow
- listEnergy:
	- approve marketplace to spend ETK
	- create listing on marketplace
- buyEnergy: buys a listing by sending exact ETH
- cancelListing: seller cancels own listing
- withdrawFees: owner withdraws accumulated platform fees
- mintTokens: owner mints ETK to a target wallet

## Important Unit Convention

The current token contract multiplies mint amount by decimals internally.

So in frontend mint flow, send human token amount directly (example: 500), not parseUnits(..., 18).

## Typical Local Development

1. Start Hardhat node in dem-project.
2. Deploy contracts from dem-project scripts.
3. Copy addresses to src/contracts/config.js.
4. Copy ABIs from dem-project artifacts to src/contracts.
5. Run npm run dev and connect MetaMask to localhost network.

## Notes

- If wallet is not connected, the app shows a welcome screen.
- Owner-only UI elements are shown only when connected account is contract owner.
- History queries currently scan from block 0, which is fine for local/demo usage.
