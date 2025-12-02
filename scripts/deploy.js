const hre = require("hardhat");

async function main() {
  const AdvancedTransit = await hre.ethers.getContractFactory("AdvancedTransit");
  const contract = await AdvancedTransit.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});