const hre = require("hardhat");

async function main() {
  // Step 1: Deploy EToken first
  const EToken = await hre.ethers.getContractFactory("EToken");
  const token = await EToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("EToken deployed to:", tokenAddress);

  // Step 2: Deploy Marketplace with EToken address
  const Marketplace = await hre.ethers.getContractFactory("EnergyMarketplace");
  const marketplace = await Marketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("EnergyMarketplace deployed to:", marketplaceAddress);

  // Step 3: Mint 500 ETK to a test seller (Account #1)
  const [owner, seller] = await hre.ethers.getSigners();
  await token.mint(seller.address, 500);
  console.log("Minted 500 ETK to seller:", seller.address);

  console.log("\n--- Save these addresses! ---");
  console.log("EToken:", tokenAddress);
  console.log("Marketplace:", marketplaceAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});