const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n🚀 Deploying EnerDEX contracts...");
  console.log("📬 Deployer:", deployer.address);

  // ── Deploy EToken ──────────────────────────────────────────
  const EToken = await ethers.getContractFactory("EToken");
  const etoken = await EToken.deploy();
  await etoken.waitForDeployment();
  const etokenAddress = await etoken.getAddress();
  console.log("✅ EToken deployed to:", etokenAddress);

  // ── Deploy EnergyMarketplace ───────────────────────────────
  const Marketplace = await ethers.getContractFactory("EnergyMarketplace");
  const marketplace = await Marketplace.deploy(etokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // ── Auto-update config.js ──────────────────────────────────
  const configPath = path.join(__dirname, "../../dem-frontend/src/contracts/config.js");
  fs.writeFileSync(configPath,
    `// AUTO-GENERATED — do not edit manually
export const ETOKEN_ADDRESS = "${etokenAddress}";
export const MARKETPLACE_ADDRESS = "${marketplaceAddress}";
`);
  console.log("✅ config.js updated!");

  // ── Auto-copy EToken ABI ───────────────────────────────────
  const abiDir = path.join(__dirname, "../../dem-frontend/src/contracts/");

  const etokenArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/EToken.sol/EToken.json"),
      "utf8"
    )
  );
  fs.writeFileSync(
    path.join(abiDir, "EToken.json"),
    JSON.stringify(etokenArtifact, null, 2)
  );
  console.log("✅ EToken ABI copied!");

  // ── Auto-copy Marketplace ABI ──────────────────────────────
  const marketArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/EnergyMarketplace.sol/EnergyMarketplace.json"),
      "utf8"
    )
  );
  fs.writeFileSync(
    path.join(abiDir, "EnergyMarketplace.json"),
    JSON.stringify(marketArtifact, null, 2)
  );
  console.log("✅ Marketplace ABI copied!");

  console.log("\n🎉 Ready! Now start your frontend: cd dem-frontend && npm run dev\n");
}

main().catch((err) => {
  console.error("❌ Deploy failed:", err);
  process.exit(1);
});