# dem-frontend

React + Vite dApp frontend for EnerDEX.

It connects to `EToken` and `EnergyMarketplace` contracts and provides:
- wallet connection and account switching
- ETK and ETH balance dashboard
- listing, buying, and canceling energy offers
- owner-only actions (mint ETK, withdraw collected fees)
- loyalty tier/discount display
- event-based history and seller income analytics

## Tech Stack

- React 19
- Vite 8
- Ethers v6
- Custom CSS UI (`src/App.css`)

## Important Files

- `src/App.jsx`: UI and contract interaction logic
- `src/App.css`: complete styling layer
- `src/contracts/EToken.json`: token ABI
- `src/contracts/EnergyMarketplace.json`: marketplace ABI
- `src/contracts/config.js`: reads deployed addresses from env

## Address Configuration (Current)

`src/contracts/config.js` uses Vite env variables:

```js
export const ETOKEN_ADDRESS = import.meta.env.VITE_ETOKEN_ADDRESS;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
```

These values are generated automatically by `dem-project/scripts/deployMarketplace.js` into `dem-frontend/.env`.

## Setup

```bash
cd dem-frontend
npm install
npm run dev
```

If contract env/ABI files are missing, run the deploy flow from `dem-project` first.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## Expected Local Workflow

1. Start local chain in `dem-project`:

```bash
cd ../dem-project
npm run node
```

2. Deploy and auto-sync frontend contract files (new terminal):

```bash
cd ../dem-project
npm run deploy
```

3. Run frontend:

```bash
cd ../dem-frontend
npm run dev
```

## Contract Interaction Summary

### Read paths
- `loadData()` reads balances, loyalty, discount, fees, listings
- `loadHistory()` reads `EnergyListed` and `EnergyTraded` events

### Write paths
- `listEnergy()`: approve ETK then list on marketplace
- `buyEnergy()`: buy listing with exact ETH
- `cancelListing()`: seller cancels own listing
- `withdrawFees()`: owner withdraws platform fee pool
- `mintTokens()`: owner mints ETK to target wallet

## Unit Convention

`EToken.mint` scales by decimals inside the contract.

Frontend mint call passes human units (example: `500`) and does not pre-scale with `parseUnits`.

## Notes

- App shows a welcome screen when wallet is disconnected.
- Owner-only UI is gated by on-chain `owner()` check.
- History currently queries from block `0` (fine for local/demo networks).
