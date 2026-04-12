# EnerDEX - Decentralized Energy Marketplace

EnerDex is a full-stack Web3 project for peer-to-peer renewable energy trading.

It is split into two main folders:
- `dem-project`: smart contracts (Hardhat + Solidity)
- `dem-frontend`: React dApp frontend (Vite + Ethers)

## Project Structure

- `dem-project/`
  - `contracts/`: EToken, EnergyMarketplace, SimpleStorage
  - `scripts/`: deployment scripts
  - `test/`: Hardhat tests
  - `artifacts/`: compiled outputs (ABIs, bytecode)
- `dem-frontend/`
  - `src/App.jsx`: main dApp UI and logic
  - `src/contracts/`: contract ABIs + deployed addresses
- `REPORT_BLC_FULL.md`: detailed technical report

## Core Features

- ERC-20 energy token (`ETK`) for energy unit representation
- Marketplace listing and purchase flow with escrow
- Platform fee collection and owner withdrawal
- Loyalty point system with dynamic fee discounts
- Wallet-based interactions through MetaMask
- Transaction history from on-chain events

## Tech Stack

### Blockchain
- Solidity 0.8.28
- Hardhat
- OpenZeppelin Contracts
- Ethers + Chai test tooling

### Frontend
- React 19
- Vite 8
- Ethers v6
- CSS-based custom UI

## Prerequisites

- Node.js 18+
- npm
- MetaMask extension

## Quick Start (End-to-End)

## 1) Start blockchain side

```bash
cd dem-project
npm install
npx hardhat compile
npx hardhat test
npx hardhat node
```

Keep the Hardhat node running in this terminal.

## 2) Deploy contracts (new terminal)

```bash
cd dem-project
npx hardhat run scripts/deployMarketplace.js --network localhost
```

This prints:
- EToken address
- EnergyMarketplace address

## 3) Sync frontend with deployed contracts

1. Update `dem-frontend/src/contracts/config.js` with deployed addresses.
2. Copy ABIs from:
   - `dem-project/artifacts/contracts/EToken.sol/EToken.json`
   - `dem-project/artifacts/contracts/EnergyMarketplace.sol/EnergyMarketplace.json`
   into `dem-frontend/src/contracts/`.

## 4) Run frontend

```bash
cd dem-frontend
npm install
npm run dev
```

Open the Vite URL, connect MetaMask to localhost, and test flows.

## Common Commands

### dem-project

```bash
cd dem-project
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deployToken.js --network localhost
npx hardhat run scripts/deployMarketplace.js --network localhost
```

### dem-frontend

```bash
cd dem-frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Integration Notes

- Frontend uses ABI + address binding for contract calls.
- Ensure `config.js` addresses always match the latest deployment.
- If contracts are redeployed, update frontend addresses and ABIs again.

## Important Token Unit Note

`EToken.mint` currently multiplies incoming amount by token decimals internally.
So frontend/admin mint input should pass human token amount (e.g., `500`), not pre-scaled units.

## Documentation

- Smart contract README: `dem-project/README.md`
- Frontend README: `dem-frontend/README.md`
- Full deep-dive report: `REPORT_BLC_FULL.md`

## License

For educational/project use. Add an explicit license file if you plan to distribute publicly.
