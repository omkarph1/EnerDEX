const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting EnerDEX deployment...\n");

  // ── Step 1: Deploy EToken ──────────────────────────────────────────
  const EToken = await hre.ethers.getContractFactory("EToken");
  const token = await EToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ EToken deployed to:", tokenAddress);

  // ── Step 2: Deploy Marketplace with EToken address ────────────────
  const Marketplace = await hre.ethers.getContractFactory("EnergyMarketplace");
  const marketplace = await Marketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ EnergyMarketplace deployed to:", marketplaceAddress);

  // ── Step 3: Mint 500 ETK to a test seller (Account #1) ────────────
  const [owner, seller] = await hre.ethers.getSigners();
  await token.mint(seller.address, 500);
  console.log("✅ Minted 500 ETK to seller:", seller.address);

  // ── Step 4: Auto-copy ABIs to frontend ────────────────────────────
  const artifactsBase = path.join(__dirname, "../artifacts/contracts");
  const frontendContracts = path.join(__dirname, "../../dem-frontend/src/contracts");

  // Create the folder if it somehow doesn't exist
  if (!fs.existsSync(frontendContracts)) {
    fs.mkdirSync(frontendContracts, { recursive: true });
  }

  fs.copyFileSync(
    path.join(artifactsBase, "EToken.sol/EToken.json"),
    path.join(frontendContracts, "EToken.json")
  );
  fs.copyFileSync(
    path.join(artifactsBase, "EnergyMarketplace.sol/EnergyMarketplace.json"),
    path.join(frontendContracts, "EnergyMarketplace.json")
  );
  console.log("✅ ABIs copied to dem-frontend/src/contracts/");

  // ── Step 5: Auto-write .env in frontend ───────────────────────────
  const envPath = path.join(__dirname, "../../dem-frontend/.env");
  const envContent =
    `VITE_ETOKEN_ADDRESS=${tokenAddress}\n` +
    `VITE_MARKETPLACE_ADDRESS=${marketplaceAddress}\n`;
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env written to dem-frontend/");

  // ── Summary ───────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT COMPLETE — Frontend auto-synced!");
  console.log("   EToken:      ", tokenAddress);
  console.log("   Marketplace: ", marketplaceAddress);
  console.log("   Seller:      ", seller.address, "(500 ETK minted)");
  console.log("\n   ▶  cd dem-frontend && npm run dev");
  console.log("══════════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});