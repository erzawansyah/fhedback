import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("=== Deploying to Sepolia Network ===");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
  );

  // Network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "| Chain ID:", network.chainId);

  console.log("\n=== Step 1: Deploying ConfidentialSurvey Implementation ===");

  // Deploy ConfidentialSurvey implementation
  const ConfidentialSurvey =
    await ethers.getContractFactory("ConfidentialSurvey");
  const confidentialSurvey = await ConfidentialSurvey.deploy();
  await confidentialSurvey.waitForDeployment();

  const surveyImplementationAddress = await confidentialSurvey.getAddress();
  console.log(
    "✅ ConfidentialSurvey Implementation deployed to:",
    surveyImplementationAddress,
  );

  console.log("\n=== Step 2: Deploying ConfidentialSurvey_Beacon ===");

  // Deploy Beacon
  const ConfidentialSurvey_Beacon = await ethers.getContractFactory(
    "ConfidentialSurvey_Beacon",
  );
  const beacon = await ConfidentialSurvey_Beacon.deploy(
    surveyImplementationAddress,
    deployer.address,
  );
  await beacon.waitForDeployment();

  const beaconAddress = await beacon.getAddress();
  console.log("✅ ConfidentialSurvey_Beacon deployed to:", beaconAddress);

  console.log("\n=== Step 3: Deploying ConfidentialSurvey_Factory ===");

  // Deploy Factory
  const ConfidentialSurvey_Factory = await ethers.getContractFactory(
    "ConfidentialSurvey_Factory",
  );
  const factory = await ConfidentialSurvey_Factory.deploy(
    beaconAddress,
    deployer.address,
  );
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("✅ ConfidentialSurvey_Factory deployed to:", factoryAddress);

  console.log("\n=== Deployment Summary ===");
  console.log(
    "ConfidentialSurvey Implementation:",
    surveyImplementationAddress,
  );
  console.log("ConfidentialSurvey_Beacon:", beaconAddress);
  console.log("ConfidentialSurvey_Factory:", factoryAddress);

  // Wait for a few block confirmations before verification
  console.log("\n=== Waiting for block confirmations ===");
  console.log("Waiting 5 blocks before verification...");
  await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute

  console.log("\n=== Starting Contract Verification ===");

  try {
    // Verify ConfidentialSurvey Implementation
    console.log("\n1. Verifying ConfidentialSurvey Implementation...");
    await hre.run("verify:verify", {
      address: surveyImplementationAddress,
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
      address: beaconAddress,
      constructorArguments: [surveyImplementationAddress, deployer.address],
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
      address: factoryAddress,
      constructorArguments: [beaconAddress, deployer.address],
    });
    console.log("✅ ConfidentialSurvey_Factory verified");
  } catch (error: unknown) {
    console.log(
      "❌ ConfidentialSurvey_Factory verification failed:",
      (error as Error).message,
    );
  }

  console.log("\n=== Testing Factory Deployment ===");

  try {
    // Test creating a survey through factory
    console.log("Creating test survey through factory...");

    const tx = await factory.createSurvey(
      deployer.address,
      "TEST01",
      "Test Survey Title",
      "QmTestMetadataCID123",
      "QmTestQuestionsCID456",
      5,
      100,
    );

    await tx.wait();
    console.log("✅ Test survey created successfully");

    // Get the created survey address
    const totalSurveys = await factory.totalSurveys();
    const testSurveyAddress = await factory.surveys(totalSurveys - 1n);
    console.log("Test survey deployed at:", testSurveyAddress);
  } catch (error: unknown) {
    console.log("❌ Test survey creation failed:", (error as Error).message);
  }

  console.log("\n=== Final Deployment Summary ===");
  console.log("🚀 All contracts deployed successfully to Sepolia!");
  console.log("📋 Contract Addresses:");
  console.log(
    "   ├─ ConfidentialSurvey Implementation:",
    surveyImplementationAddress,
  );
  console.log("   ├─ ConfidentialSurvey_Beacon:", beaconAddress);
  console.log("   └─ ConfidentialSurvey_Factory:", factoryAddress);
  console.log("\n📝 Etherscan URLs:");
  console.log(
    "   ├─ Implementation: https://sepolia.etherscan.io/address/" +
      surveyImplementationAddress,
  );
  console.log(
    "   ├─ Beacon: https://sepolia.etherscan.io/address/" + beaconAddress,
  );
  console.log(
    "   └─ Factory: https://sepolia.etherscan.io/address/" + factoryAddress,
  );
  console.log("\n💡 Usage:");
  console.log("   Use the Factory contract to create new surveys");
  console.log("   Factory Address:", factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
