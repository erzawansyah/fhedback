import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  const MyContract = await ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy("Hello, Sepolia!");

  await myContract.waitForDeployment();
  const address = await myContract.getAddress();

  console.log("MyContract deployed to:", address);
  console.log("Transaction hash:", myContract.deploymentTransaction()?.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
