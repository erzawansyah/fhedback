import { ethers } from "hardhat";

async function main() {
  console.log("Testing API Key...");
  console.log(
    "ETHERSCAN_API_KEY:",
    process.env.ETHERSCAN_API_KEY ? "Set" : "Not set"
  );

  if (process.env.ETHERSCAN_API_KEY) {
    console.log("API Key length:", process.env.ETHERSCAN_API_KEY.length);
    console.log(
      "API Key (first 6 chars):",
      process.env.ETHERSCAN_API_KEY.substring(0, 6)
    );
  }
}

main().catch(console.error);
