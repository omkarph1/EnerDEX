const hre = require("hardhat");

async function main() {
  const EToken = await hre.ethers.getContractFactory("EToken");
  const token = await EToken.deploy();
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("EToken deployed to:", address);
  console.log("1 ETK = 1 kWh of energy");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});