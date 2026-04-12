# dem-project Detailed Report

## 1) Scope
`dem-project` is the blockchain core of EnerDEX.

It provides:
- token issuance (`EToken`)
- escrow marketplace logic (`EnergyMarketplace`)
- test coverage and local deployment workflows

## 2) Toolchain

- Hardhat `^2.28.6`
- Solidity compiler target `0.8.28`
- Hardhat Toolbox (`@nomicfoundation/hardhat-toolbox`)
- OpenZeppelin Contracts `^5.6.1`

`hardhat.config.js` includes a localhost network (`http://127.0.0.1:8545`) with `timeout: 60000`.

## 3) Directory Intent

- `contracts/`: on-chain business logic
- `scripts/`: deployment automation
- `test/`: behavior validation
- `artifacts/` and `cache/`: generated outputs

## 4) Contract Engineering

### 4.1 `EToken.sol`

Inheritance:
- `ERC20`
- `Ownable`

Behavior:
- constructor mints `1000 * 10^decimals()` to deployer
- owner-only `mint(address,uint256)` mints `amount * 10^decimals()`

Operational implication:
- mint callers must pass human token units, not pre-scaled base units

### 4.2 `EnergyMarketplace.sol`

Key state:
- `energyToken`
- `listings` mapping and `listingCount`
- `loyaltyPoints`
- `collectedFees`

Constants:
- `FEE_PERCENT = 2`
- `POINTS_PER_TRADE = 10`

Key functions:
- `listEnergy(amountETK, priceWei)`
  - validates inputs
  - pulls `amountETK * 10^18` from seller into escrow
  - stores active listing and emits `EnergyListed`
- `buyEnergy(listingId)`
  - validates active listing, buyer != seller, exact ETH amount
  - computes loyalty discount via `getDiscount`
  - updates listing status before transfers
  - transfers ETK to buyer and ETH minus fee to seller
  - accumulates fees and awards loyalty points
  - emits `EnergyTraded`
- `cancelListing(listingId)`
  - seller-only cancellation and escrow return
- `withdrawFees()`
  - owner-only transfer of collected platform fees
- `getDiscount(address)`
  - 10/25/50 percent discount tiers by points

### 4.3 `SimpleStorage.sol`

Basic standalone storage contract, unrelated to marketplace flow.

## 5) Test Coverage

### `test/EToken.test.js`
Verifies:
- deployer initial token supply
- token name/symbol
- owner minting
- non-owner mint revert

### `test/EnergyMarketplace.test.js`
Verifies:
- listing creation
- buy flow token + ETH movement
- 2% fee accounting
- loyalty point accrual
- discount behavior in follow-up trade
- listing cancellation
- revert paths (inactive listing, self-buy, wrong ETH)
- owner fee withdrawal

## 6) Script and Workflow Changes (Current)

`package.json` scripts are now explicit and usable:

- `npm run compile`
- `npm test`
- `npm run node`
- `npm run deploy`

`scripts/deployMarketplace.js` now does more than deployment:

1. Deploys `EToken`
2. Deploys `EnergyMarketplace`
3. Mints 500 ETK to local seller account
4. Copies ABI files to frontend contracts directory
5. Writes `dem-frontend/.env` with deployed addresses

This eliminates manual ABI/address synchronization for local development.

## 7) Local Runbook

Terminal A:

```bash
cd dem-project
npm run node
```

Terminal B:

```bash
cd dem-project
npm run deploy
```

Terminal C (frontend):

```bash
cd ../dem-frontend
npm run dev
```

## 8) Strengths

- clear token-market responsibility split
- practical test suite for critical business paths
- improved deploy ergonomics via frontend auto-sync
- straightforward local developer workflow

## 9) Risks / Hardening Targets

- strict unit consistency remains important across frontend and contracts
- no dedicated reentrancy guard modifier on marketplace write paths
- indexing strategy needed for scale beyond local/demo event queries

## 10) Summary
`dem-project` is a solid Hardhat backend with working tests and upgraded deployment automation, making it easier to run the full dApp stack consistently on localhost.
