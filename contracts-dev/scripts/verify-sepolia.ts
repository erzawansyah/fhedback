import hre from "hardhat";

// Contract addresses (isi dengan alamat contract yang sudah di-deploy)
const SURVEY_IMPLEMENTATION = "0x"; // Ganti dengan alamat ConfidentialSurvey Implementation
const BEACON_ADDRESS = "0x"; // Ganti dengan alamat ConfidentialSurvey_Beacon
const FACTORY_ADDRESS = "0x"; // Ganti dengan alamat ConfidentialSurvey_Factory

async function main() {
  console.log("=== Verifying Contracts on Sepolia ===");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Verifying with account:", deployer.address);

  if (
    SURVEY_IMPLEMENTATION === "0x" ||
    BEACON_ADDRESS === "0x" ||
    FACTORY_ADDRESS === "0x"
  ) {
    console.log(
      "❌ Please update the contract addresses in this script first!",
    );
    return;
  }

  try {
    // Verify ConfidentialSurvey Implementation
    console.log("\n1. Verifying ConfidentialSurvey Implementation...");
    await hre.run("verify:verify", {
      address: SURVEY_IMPLEMENTATION,
      constructorArguments: [],
    });
    console.log("✅ ConfidentialSurvey Implementation verified");
  } catch (error: unknown) {
    console.log(
      "❌ ConfidentialSurvey Implementation verification failed:",
      (error as Error).message,
    );
  }

  try {
    // Verify Beacon
    console.log("\n2. Verifying ConfidentialSurvey_Beacon...");
    await hre.run("verify:verify", {
      address: BEACON_ADDRESS,
      constructorArguments: [SURVEY_IMPLEMENTATION, deployer.address],
    });
    console.log("✅ ConfidentialSurvey_Beacon verified");
  } catch (error: unknown) {
    console.log(
      "❌ ConfidentialSurvey_Beacon verification failed:",
      (error as Error).message,
    );
  }

  try {
    // Verify Factory
    console.log("\n3. Verifying ConfidentialSurvey_Factory...");
    await hre.run("verify:verify", {
      address: FACTORY_ADDRESS,
      constructorArguments: [BEACON_ADDRESS, deployer.address],
    });
    console.log("✅ ConfidentialSurvey_Factory verified");
  } catch (error: unknown) {
    console.log(
      "❌ ConfidentialSurvey_Factory verification failed:",
      (error as Error).message,
    );
  }

  console.log("\n=== Verification Complete ===");
  console.log("📝 Etherscan URLs:");
  console.log(
    "   ├─ Implementation: https://sepolia.etherscan.io/address/" +
      SURVEY_IMPLEMENTATION,
  );
  console.log(
    "   ├─ Beacon: https://sepolia.etherscan.io/address/" + BEACON_ADDRESS,
  );
  console.log(
    "   └─ Factory: https://sepolia.etherscan.io/address/" + FACTORY_ADDRESS,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
