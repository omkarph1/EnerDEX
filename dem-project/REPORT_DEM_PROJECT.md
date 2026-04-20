# dem-project — Detailed Technical Report

**Package:** `dem-project`  
**Role:** Blockchain / smart contract layer for EnerDEX  
**Date:** April 2026

---

## 1. Scope

`dem-project` is the on-chain backend for EnerDEX. It is responsible for:

- Issuing and managing the ERC-20 energy token (`EToken`)
- Enforcing the peer-to-peer energy trading rules via `EnergyMarketplace`
- Providing a reproducible local deployment workflow that auto-syncs the frontend
- Validating business logic through a comprehensive Hardhat test suite

---

## 2. Toolchain

| Tool | Version / Detail |
|---|---|
| Hardhat | `^2.28.6` |
| Solidity compiler | `0.8.28` |
| OpenZeppelin Contracts | `^5.6.1` |
| Hardhat Toolbox | `^6.1.2` (bundles Ethers, Chai, coverage, typechain) |
| Network | `localhost` — `http://127.0.0.1:8545`, timeout `60000ms` |

---

## 3. Directory Structure

```
dem-project/
├── contracts/
│   ├── EToken.sol               # ERC-20 energy token
│   └── EnergyMarketplace.sol    # Escrow marketplace
├── scripts/
│   ├── deployMarketplace.js     # Primary deployment script (+ frontend sync)
│   └── deployToken.js           # EToken-only deploy
├── test/
│   ├── EToken.test.js
│   └── EnergyMarketplace.test.js
├── artifacts/                   # Compiled output (gitignored)
├── cache/                       # Hardhat build cache (gitignored)
├── hardhat.config.js
└── package.json
```

---

## 4. Contract Engineering

### 4.1 `EToken.sol`

**Inheritance:** `ERC20`, `Ownable` (OpenZeppelin v5)

```solidity
constructor() ERC20("EnergyToken", "ETK") Ownable(msg.sender) {
    _mint(msg.sender, 1000 * 10 ** decimals());
}

function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount * 10 ** decimals());
}
```

**Behaviour:**
- Constructor mints `1000 × 10^18` base units to the deployer
- `mint` is restricted to the owner and scales the input by `10^18` internally
- Callers must pass human-readable token units (e.g. `500`, not `500000000000000000000`)

---

### 4.2 `EnergyMarketplace.sol`

**Inheritance:** `Ownable` (OpenZeppelin v5)

#### State Variables

| Variable | Type | Description |
|---|---|---|
| `energyToken` | `EToken public` | Reference to the deployed EToken contract |
| `listings` | `mapping(uint256 => Listing)` | All listings by sequential ID |
| `listingCount` | `uint256 public` | Number of listings ever created (used as next ID) |
| `loyaltyPoints` | `mapping(address => uint256)` | Points earned per address |
| `collectedFees` | `uint256 public` | Accumulated platform fees (wei) |
| `FEE_PERCENT` | `uint256 constant` | `2` |
| `POINTS_PER_TRADE` | `uint256 constant` | `10` |

#### Listing Struct

```solidity
struct Listing {
    address seller;
    uint256 amountETK;   // human token units (e.g. 50 ETK)
    uint256 priceWei;    // total ETH price in wei
    bool    isActive;
}
```

#### Events

| Event | Parameters | Emitted by |
|---|---|---|
| `EnergyListed` | `listingId`, `seller`, `amountETK`, `priceWei` | `listEnergy` |
| `EnergyTraded` | `listingId`, `buyer`, `seller`, `amountETK`, `priceWei` | `buyEnergy` |
| `ListingCancelled` | `listingId` | `cancelListing` |

#### Function Analysis

**`listEnergy(uint256 amountETK, uint256 priceWei)`**
- Validates non-zero amount and price
- Calls `energyToken.transferFrom(seller, this, amountETK × 10^18)` to escrow tokens
- Records the listing in the `listings` mapping
- Increments `listingCount` after emitting `EnergyListed`

**`buyEnergy(uint256 listingId)`** *(payable)*
- Validates: listing is active, buyer ≠ seller, `msg.value == priceWei`
- Computes discount via `getDiscount(msg.sender)`
- Calculates fee: `(priceWei × FEE_PERCENT × (100 − discount)) / 10000`
- Marks listing inactive and accumulates fee **before** any external calls
- Transfers `amountETK × 10^18` ETK to buyer
- Transfers `priceWei − fee` ETH to seller via low-level `.call`
- Awards `POINTS_PER_TRADE` to both buyer and seller
- Emits `EnergyTraded`

**`cancelListing(uint256 listingId)`**
- Validates: listing is active, caller is the seller
- Marks listing inactive
- Returns `amountETK × 10^18` ETK to the seller
- Emits `ListingCancelled`

**`withdrawFees()`** *(onlyOwner)*
- Reads `collectedFees`, resets it to zero, transfers the full amount to `owner()`

**`getDiscount(address user)`** *(view)*

| Loyalty Points | Returned Discount |
|---|---|
| ≥ 100 | 50 |
| ≥ 50 | 25 |
| ≥ 10 | 10 |
| < 10 | 0 |

**`getListing(uint256 listingId)`** *(view)*
- Returns `(seller, amountETK, priceWei, isActive)`

#### Security Design

`buyEnergy` follows the **checks-effects-interactions** pattern and uses OpenZeppelin's `ReentrancyGuard` modifier for explicit security:
1. `nonReentrant` modifier is applied to the function
2. All `require` checks (listing validity, caller, value)
3. State mutations (`isActive = false`, `collectedFees +=`)
4. External token and ETH transfers

---



## 5. Deployment Script — `scripts/deployMarketplace.js`

The primary script performs five sequential steps:

| Step | Action |
|---|---|
| 1 | Deploy `EToken`; log deployed address |
| 2 | Deploy `EnergyMarketplace` with EToken address; log deployed address |
| 3 | Call `token.mint(signers[1].address, 500)` — gives 500 ETK to the test seller |
| 4 | Copy `EToken.json` and `EnergyMarketplace.json` from `artifacts/` to `dem-frontend/src/contracts/` |
| 5 | Write `VITE_ETOKEN_ADDRESS` and `VITE_MARKETPLACE_ADDRESS` to `dem-frontend/.env` |

This means a fresh `npm run deploy` always leaves the frontend fully configured and ready to start.

---

## 6. Test Suite Analysis

### `test/EToken.test.js`

| Test | Verifies |
|---|---|
| Initial supply | Deployer balance equals 1000 ETK |
| Token metadata | `name()` returns `"EnergyToken"`, `symbol()` returns `"ETK"` |
| Owner mint | `mint(address, 500)` increases recipient balance by 500 ETK |
| Non-owner mint | Call from non-owner address reverts |

### `test/EnergyMarketplace.test.js`

| Test | Verifies |
|---|---|
| Listing creation | `isActive` is true; `amountETK` and `priceWei` are stored correctly |
| Buy — ETK transfer | Buyer receives correct ETK amount |
| Buy — ETH transfer | Seller receives `priceWei − fee`; buyer pays `priceWei` |
| Fee accounting | `collectedFees` increases by the correct fee amount |
| Loyalty accrual | Buyer and seller each gain 10 points after a trade |
| Discount application | Second trade by buyer with ≥10 points uses reduced fee |
| Cancel listing | Seller gets ETK back; `isActive` becomes false |
| Revert: inactive listing | `buyEnergy` reverts if listing is already inactive |
| Revert: self-buy | Seller cannot purchase their own listing |
| Revert: wrong ETH | Sending incorrect ETH amount reverts |
| Fee withdrawal | `withdrawFees` transfers full fee balance to owner; resets to zero |

---

## 7. npm Scripts

| Script | Underlying Command |
|---|---|
| `npm run compile` | `hardhat compile` |
| `npm test` | `hardhat test` |
| `npm run node` | `hardhat node` |
| `npm run deploy` | `hardhat run scripts/deployMarketplace.js --network localhost` |

---

## 8. Local Development Runbook

**Terminal A — blockchain node:**

```bash
cd dem-project
npm run node
```

**Terminal B — deploy and sync frontend:**

```bash
cd dem-project
npm run deploy
```

**Terminal C — frontend (see `dem-frontend/`):**

```bash
cd dem-frontend
npm run dev
```

---

## 9. Strengths

- Clear separation of token and marketplace responsibilities
- Comprehensive test suite covering both happy paths and all documented revert conditions
- Automated deployment pipeline eliminates manual ABI/address synchronisation
- Security-conscious: checks-effects-interactions ordering in all write paths
- Explicit Solidity version pinning (`0.8.28`) for reproducibility

---

## 10. Known Limitations and Recommendations

| Item | Detail | Recommendation |
|---|---|---|
| Fixed fee and point constants | Cannot be updated without redeployment | Make configurable via owner-callable setters |
| No custom Solidity errors | Uses string `require` — higher gas cost | Replace with `error` declarations and `revert` |
| Marketplace scale | No event indexing strategy | Add The Graph support or block-range queries for production |
| No CI pipeline | Tests are run manually | Add GitHub Actions workflow for automated test runs |

---

## 11. Summary

`dem-project` provides a well-structured and fully tested smart contract backend for the EnerDEX platform. The deployment automation makes local development fast and reliable. For production readiness, the primary hardening targets are replacing string-based reverts with custom errors and integrating a CI pipeline.
