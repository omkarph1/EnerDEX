# dem-project Detailed Report

## 1) Purpose and Scope
The `dem-project` folder is the blockchain backend of BLC, built with Hardhat. It defines and tests smart contracts for:
- ETK token issuance (`EToken`)
- Peer-to-peer energy trading with escrow (`EnergyMarketplace`)
- A sample learning contract (`SimpleStorage`)

It also includes deployment scripts and generated artifacts used by the frontend.

## 2) Technology and Toolchain

### Core components
- Hardhat 2.x (development framework)
- Ethers integration via Hardhat toolbox
- Chai-based contract tests
- OpenZeppelin Contracts v5 for audited ERC20 and Ownable primitives

### Solidity settings
- `hardhat.config.js` sets compiler target to Solidity `0.8.28`.

## 3) Directory Breakdown and Intent

### Source and config
- `contracts/`
  - `EToken.sol`
  - `EnergyMarketplace.sol`
  - `SimpleStorage.sol`
- `hardhat.config.js`

### Deployment
- `scripts/deploy.js` (SimpleStorage)
- `scripts/deployToken.js` (EToken only)
- `scripts/deployMarketplace.js` (EToken + Marketplace + seed mint)

### Validation
- `test/EToken.test.js`
- `test/EnergyMarketplace.test.js`

### Generated outputs
- `artifacts/` and `cache/` from compilation
- ABIs consumed by frontend are produced here

## 4) Contract-by-Contract Engineering Detail

## 4.1 EToken (`contracts/EToken.sol`)

### Inheritance
- `ERC20` from OpenZeppelin
- `Ownable` for privileged minting

### Constructor behavior
- Name: `EnergyToken`
- Symbol: `ETK`
- Mints initial supply of 1000 ETK to deployer (`1000 * 10**decimals()`)

### Mint function
- Restricted by `onlyOwner`
- Mints `amount * 10**decimals()` to target address

### Design implication
The mint function expects human token units as input (e.g., `500`), not already-scaled base units. If clients pre-scale, supply will be magnified.

## 4.2 EnergyMarketplace (`contracts/EnergyMarketplace.sol`)

### Core state
- `energyToken`: token contract reference
- `listings`: mapping of listing ID to listing struct
- `listingCount`: monotonic listing index
- `loyaltyPoints`: per-address points ledger
- `collectedFees`: platform fee pool

### Listing model
`Listing` contains:
- seller address
- `amountETK` (human unit amount)
- `priceWei`
- active flag

### Fee + loyalty constants
- `FEE_PERCENT = 2`
- `POINTS_PER_TRADE = 10`

### Main functions

#### `listEnergy(amountETK, priceWei)`
- Validates amount and price > 0
- Pulls tokens from seller into escrow with `transferFrom`
- Internally multiplies by `10**18` for token transfer
- Creates active listing and emits `EnergyListed`

#### `buyEnergy(listingId)`
- Requires active listing, non-self purchase, exact ETH price
- Computes fee with loyalty-based discount tiers
- Sets listing inactive before external transfers
- Transfers ETK to buyer (`amountETK * 10**18`)
- Sends seller ETH minus fee
- Accumulates fees
- Awards loyalty points to both buyer and seller
- Emits `EnergyTraded`

#### `cancelListing(listingId)`
- Seller-only cancellation
- Marks listing inactive
- Returns ETK from escrow to seller
- Emits `ListingCancelled`

#### `withdrawFees()`
- Owner-only transfer of accumulated fee pool

#### `getDiscount(user)`
Tier schedule:
- >=10 points: 10%
- >=50 points: 25%
- >=100 points: 50%

#### `getListing(listingId)`
- Exposes listing fields for frontend consumption

## 4.3 SimpleStorage (`contracts/SimpleStorage.sol`)
A basic educational contract for storing and retrieving one `uint256` value. Independent from marketplace logic.

## 5) Test Suite Analysis

## 5.1 EToken tests
Validates:
- initial deployer allocation (1000 ETK)
- token metadata (name/symbol)
- owner mint success
- non-owner mint rejection with custom Ownable error

## 5.2 EnergyMarketplace tests
Validates:
- listing creation and active state
- escrow + purchase transfer behavior
- 2% fee accounting
- loyalty point accrual
- discount application on subsequent trades
- listing cancel path and token return
- key revert scenarios:
  - inactive listing purchase
  - seller self-purchase
  - incorrect ETH sent
- owner fee withdrawal

Overall, tests provide good functional coverage for the main happy paths and important guards.

## 6) Deployment Workflow Engineering

### Script options
- `deploy.js`: deploys only `SimpleStorage`
- `deployToken.js`: deploys only `EToken`
- `deployMarketplace.js`: deploys token + marketplace and mints seed ETK to seller account

### Typical local deployment sequence
1. Start Hardhat local network (`npx hardhat node`) in one terminal.
2. Run deploy script against localhost network.
3. Capture printed contract addresses.
4. Copy addresses to frontend `src/contracts/config.js`.
5. Copy ABI files from `artifacts/contracts/...` into frontend `src/contracts/`.

## 7) Reproducibility: How to Build the Same dem-project

1. Initialize project
- `mkdir dem-project && cd dem-project`
- `npm init -y`
- `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`
- `npm install @openzeppelin/contracts`

2. Initialize hardhat config and set Solidity 0.8.28.

3. Implement contracts
- `EToken.sol` with ERC20 + Ownable minting
- `EnergyMarketplace.sol` with escrow/listings/fees/loyalty

4. Add deploy scripts for token and marketplace.

5. Add tests for token and marketplace paths.

6. Run:
- `npx hardhat compile`
- `npx hardhat test`

## 8) Current Operational Notes
- `package.json` test script is placeholder (`"Error: no test specified"`), but project tests are run through Hardhat CLI directly (`npx hardhat test`).
- Generated artifacts in `artifacts/` and `cache/` suggest contracts were compiled and used.

## 9) Strengths
- Clear separation of token and market responsibilities
- Uses OpenZeppelin security primitives
- Includes practical testing of business logic
- Includes deployment scripts supporting local demo workflows

## 10) Risks and Design Caveats
- Unit conversion conventions must be consistent between frontend and contract calls.
- Event/state reads can become heavy on large chains without indexing strategy.
- ETH transfer uses low-level call; checks are present but no reentrancy guard layer is used.

## 11) Summary
`dem-project` is a practical Hardhat smart contract implementation for a decentralized energy marketplace concept, complete with contract logic, tests, and deployment scripts suitable for local and educational dApp development.
