# dem-project

Hardhat smart contract project for the BLC decentralized energy marketplace.

This folder contains:
- ETK token contract
- marketplace contract with escrow, fees, and loyalty system
- deployment scripts
- unit/integration tests

## Tech Stack

- Hardhat
- Solidity 0.8.28
- OpenZeppelin Contracts
- Ethers + Chai (through hardhat-toolbox)

## Contracts

## 1) EToken.sol

ERC-20 token representing energy units.

Key behavior:
- token name: EnergyToken
- symbol: ETK
- initial mint: 1000 ETK to deployer
- only owner can mint new supply

## 2) EnergyMarketplace.sol

Marketplace for peer-to-peer ETK trading.

Core features:
- sellers list ETK for ETH price
- ETK goes to escrow in contract
- buyers purchase with exact ETH amount
- platform fee collected (base 2%)
- loyalty points awarded to buyer and seller
- discount tiers based on loyalty points
- owner can withdraw collected fees

Discount tiers:
- 10+ points -> 10% fee discount
- 50+ points -> 25% fee discount
- 100+ points -> 50% fee discount

## 3) SimpleStorage.sol

Small sample contract used for basic Hardhat deployment/demo.

## Project Structure

- contracts/: Solidity contracts
- scripts/: deployment scripts
- test/: Hardhat test suite
- artifacts/: generated ABI and bytecode
- cache/: hardhat build cache

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Compile

```bash
npx hardhat compile
```

## Test

```bash
npx hardhat test
```

## Run Local Chain

```bash
npx hardhat node
```

## Deployment Scripts

### Deploy only SimpleStorage

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy only EToken

```bash
npx hardhat run scripts/deployToken.js --network localhost
```

### Deploy EToken + EnergyMarketplace (+ seed mint)

```bash
npx hardhat run scripts/deployMarketplace.js --network localhost
```

This script:
1. Deploys EToken
2. Deploys EnergyMarketplace with token address
3. Mints 500 ETK to a test seller account
4. Prints both contract addresses

## Frontend Integration (dem-frontend)

After deployment:

1. Copy contract addresses into dem-frontend/src/contracts/config.js
2. Copy ABIs into dem-frontend/src/contracts:
- artifacts/contracts/EToken.sol/EToken.json
- artifacts/contracts/EnergyMarketplace.sol/EnergyMarketplace.json

## Test Coverage Overview

EToken tests include:
- initial supply
- token metadata
- owner minting
- non-owner mint rejection

EnergyMarketplace tests include:
- listing creation
- purchase transfer behavior
- fee accounting
- loyalty point accrual
- discount fee behavior
- listing cancellation
- expected revert scenarios
- owner fee withdrawal

## Important Unit Convention

EToken mint function currently multiplies input amount by decimals internally.

Clients should send human token amount to mint (example: 500), not pre-scaled base units.

## Common Local Workflow

1. Start node: npx hardhat node
2. Deploy contracts: npx hardhat run scripts/deployMarketplace.js --network localhost
3. Update frontend config and ABIs
4. Start frontend and test end-to-end flow
