# dem-project

Hardhat smart-contract backend for EnerDEX.

This package contains:
- energy token contract (`EToken`)
- marketplace contract (`EnergyMarketplace`)
- sample contract (`SimpleStorage`)
- deployment scripts
- test suites

## Stack

- Hardhat
- Solidity 0.8.28
- OpenZeppelin Contracts
- Hardhat Toolbox (Ethers + Chai)

## Contracts

### `contracts/EToken.sol`

- ERC20 token name: `EnergyToken`
- symbol: `ETK`
- constructor mints 1000 ETK to deployer
- `mint(address,uint256)` is owner-only and scales by token decimals internally

### `contracts/EnergyMarketplace.sol`

- sellers create ETK listings for ETH
- ETK moved into contract escrow via `transferFrom`
- buyers purchase with exact ETH
- platform fee base: 2%
- loyalty points for buyer and seller on successful trades
- fee discount tiers by loyalty points:
  - 10+ points: 10%
  - 50+ points: 25%
  - 100+ points: 50%
- owner can withdraw `collectedFees`

### `contracts/SimpleStorage.sol`

Minimal sample contract used for basic deployment demonstration.

## Scripts (Current)

`package.json` includes:

- `npm run compile` -> `hardhat compile`
- `npm test` -> `hardhat test`
- `npm run node` -> `hardhat node`
- `npm run deploy` -> `hardhat run scripts/deployMarketplace.js --network localhost`

## Deployment Behavior (Updated)

`scripts/deployMarketplace.js` now performs end-to-end setup:

1. Deploy `EToken`
2. Deploy `EnergyMarketplace`
3. Mint 500 ETK to local seller account (`signers[1]`)
4. Copy ABIs to frontend:
	- `dem-frontend/src/contracts/EToken.json`
	- `dem-frontend/src/contracts/EnergyMarketplace.json`
5. Write frontend `.env` with deployed addresses:
	- `VITE_ETOKEN_ADDRESS`
	- `VITE_MARKETPLACE_ADDRESS`

## Quick Start

```bash
cd dem-project
npm install
npm run compile
npm test
npm run node
```

In another terminal:

```bash
cd dem-project
npm run deploy
```

## Standalone Deploy Scripts

- `scripts/deploy.js`: deploy only `SimpleStorage`
- `scripts/deployToken.js`: deploy only `EToken`
- `scripts/deployMarketplace.js`: deploy token + marketplace and sync frontend

## Test Coverage Snapshot

### EToken tests
- initial deployer balance
- metadata (name/symbol)
- owner mint success
- non-owner mint rejection

### EnergyMarketplace tests
- listing creation and active state
- buy flow token/ETH transfer behavior
- fee accounting
- loyalty points accrual
- discount behavior on subsequent trade
- cancel listing path
- revert conditions (inactive/self-buy/wrong ETH)
- owner fee withdrawal

## Unit Convention

Because token `mint` scales by decimals internally, callers should pass human units (example: `500`) rather than pre-scaled base units.
