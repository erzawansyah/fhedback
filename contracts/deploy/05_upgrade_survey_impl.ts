import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("=== Upgrading ConfidentialSurvey Implementation ===");
  console.log("Deployer address:", deployer);

  // Get existing beacon
  let beacon;
  try {
    beacon = await get("ConfidentialSurvey_Beacon");
  } catch {
    console.log(
      "❌ ConfidentialSurvey_Beacon not found. Deploy the system first.",
    );
    throw new Error("Beacon not deployed");
  }

  console.log(`📋 Using Beacon: ${beacon.address}`);

  // Get current implementation
  const beaconContract = await hre.ethers.getContractAt(
    "ConfidentialSurvey_Beacon",
    beacon.address,
  );
  const oldImplementation = await beaconContract.implementation();
  console.log(`📋 Current Implementation: ${oldImplementation}`);

  // Deploy new implementation
  console.log("\n🚀 Deploying New ConfidentialSurvey Implementation...");
  const newImpl = await deploy("ConfidentialSurvey", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ New Implementation deployed: ${newImpl.address}`);

  // Upgrade beacon
  console.log("\n🔄 Upgrading Beacon Implementation...");
  try {
    const upgradeTx = await beaconContract.upgradeTo(newImpl.address);
    await upgradeTx.wait();
    console.log(`✅ Beacon upgraded successfully!`);

    // Verify upgrade
    const currentImplementation = await beaconContract.implementation();
    console.log(`✅ Current Implementation: ${currentImplementation}`);

    if (currentImplementation.toLowerCase() === newImpl.address.toLowerCase()) {
      console.log(`✅ Upgrade verification passed!`);
    } else {
      console.log(`❌ Upgrade verification failed!`);
    }
  } catch (error) {
    console.log(`❌ Upgrade failed: ${error}`);
    throw error;
  }

  console.log("\n📋 Upgrade Summary:");
  console.log(`   ├─ Beacon: ${beacon.address}`);
  console.log(`   ├─ Old Implementation: ${oldImplementation}`);
  console.log(`   └─ New Implementation: ${newImpl.address}`);

  console.log(
    "\n💡 Note: All existing surveys now use the new implementation!",
  );
};

export default func;
func.id = "upgrade_survey_implementation";
func.tags = ["UpgradeSurvey", "Upgrade"];
