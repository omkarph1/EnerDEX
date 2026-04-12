# dem-frontend Detailed Report

## 1) Scope
`dem-frontend` is the user-facing dApp for EnerDEX.

It interacts with:
- `EToken` (ERC20 energy token)
- `EnergyMarketplace` (escrow trading, fee logic, loyalty rules)

The application is a single-page React UI handling wallet state, reads/writes to contracts, and event-driven reporting screens.

## 2) Current Stack

- React 19
- Vite 8
- Ethers v6
- ESLint flat config

Runtime pattern:
- MetaMask provider (`window.ethereum`)
- read-only contract calls through provider
- write calls via signer from `BrowserProvider`

## 3) Project Structure (Frontend)

- `src/main.jsx`: bootstraps app
- `src/App.jsx`: main logic and rendering
- `src/App.css`: component/theme styling
- `src/contracts/EToken.json`: token ABI
- `src/contracts/EnergyMarketplace.json`: marketplace ABI
- `src/contracts/config.js`: env-based contract address mapping

## 4) Recent Integration Change (Important)

Configuration moved from static addresses to env variables:

```js
export const ETOKEN_ADDRESS = import.meta.env.VITE_ETOKEN_ADDRESS;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
```

Deploy script in `dem-project` now writes these values automatically to `dem-frontend/.env` and copies the ABI files, reducing manual sync errors.

## 5) Frontend Architecture Details

### 5.1 State model
Main UI state groups include:
- wallet/account (`account`, dropdown state)
- balances and role (`ethBalance`, `etkBalance`, `isOwner`, `collectedFees`)
- market form/listing state (`sellAmount`, `sellPrice`, `listings`)
- history/income (`txHistory`, `incomeStats`, history loading)
- UX state (`status`, `statusType`, `loading`, active tab)
- admin mint inputs (`mintAddress`, `mintAmount`)

### 5.2 Contract access
`getContracts()` centralizes signer + contract construction and is used by write actions.

### 5.3 Read actions
- `loadData()`:
  - reads ETH/ETK balances, loyalty points, discount
  - checks `owner()` and `collectedFees()`
  - loads active listings through `listingCount` + `getListing(i)`
- `loadHistory()`:
  - queries `EnergyTraded` and `EnergyListed`
  - maps and merges events
  - computes seller income summary

### 5.4 Write actions
- `listEnergy()`: approve then list
- `buyEnergy()`: purchase with exact ETH
- `cancelListing()`: cancel own listing
- `withdrawFees()`: owner-only fee withdrawal
- `mintTokens()`: owner-only token minting

## 6) UX Behavior

- Wallet-disconnected welcome screen
- Tabbed interface: dashboard, market, history, income, loyalty
- Status notifications for tx lifecycle
- Address/hash copy helpers
- Owner-only admin panel based on on-chain owner check

## 7) Unit and Conversion Conventions

- ETK display uses `formatUnits(value, 18)`
- listing approval uses `parseUnits(sellAmount, 18)`
- marketplace list call takes human amount (`listEnergy(uint256 amountETK, ...)`)
- mint call passes human amount directly (`token.mint(address, amount)`)

The last point matches the current token contract implementation that multiplies by decimals inside `mint`.

## 8) Current Strengths

- broad MVP feature coverage
- clear transaction feedback during write operations
- practical owner/admin controls
- event-driven history and income tracking
- improved deployment integration through env + ABI auto-sync

## 9) Current Constraints

- `App.jsx` is large and should be split into components/hooks
- no dedicated frontend test suite yet
- history queries from block 0 are not optimized for long-lived chains
- `.env` is local-only and must be regenerated on each fresh deployment

## 10) Reproducible Local Usage

1. Start node in `dem-project`: `npm run node`
2. Deploy in `dem-project`: `npm run deploy`
3. Start frontend in `dem-frontend`: `npm run dev`
4. Connect MetaMask and execute list/buy/cancel/admin flows

## 11) Summary
`dem-frontend` is a functional production-style dApp interface for the EnerDEX contracts, now improved with automated contract artifact/address synchronization from deployment to frontend runtime configuration.
