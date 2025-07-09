// scripts/list-contracts.ts
import fs from "fs";
import path from "path";

async function main() {
  const contractsDir = "contracts";

  if (!fs.existsSync(contractsDir)) {
    console.error("❌ Contracts directory not found");
    return;
  }

  try {
    const contractFiles = fs
      .readdirSync(contractsDir)
      .filter((file) => file.endsWith(".sol"))
      .map((file) => file.replace(".sol", ""));

    if (contractFiles.length === 0) {
      console.log("📁 No contracts found in contracts/ directory");
      return;
    }

    console.log("📋 Available contracts:");
    contractFiles.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    console.log("\n💡 Usage:");
    console.log(
      "  npx hardhat run scripts/generate-contract-artifacts.ts ContractName"
    );

    console.log("\n📝 Examples:");
    contractFiles.forEach((name) => {
      console.log(
        `  npx hardhat run scripts/generate-contract-artifacts.ts ${name}`
      );
    });
  } catch (error) {
    console.error("❌ Error reading contracts directory:", error);
  }
}

main().catch(console.error);
