import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("=== Deploying ConfidentialSurvey_Beacon ===");
  console.log("Deployer address:", deployer);

  // Get Survey Implementation
  let surveyImpl;
  try {
    surveyImpl = await get("ConfidentialSurvey");
  } catch {
    console.log(
      "❌ ConfidentialSurvey implementation not found. Deploy it first with:",
    );
    console.log("   npx hardhat deploy --tags SurveyImpl");
    throw new Error("ConfidentialSurvey implementation not deployed");
  }

  console.log(`📋 Using Survey Implementation: ${surveyImpl.address}`);

  // Deploy Beacon
  const beacon = await deploy("ConfidentialSurvey_Beacon", {
    from: deployer,
    args: [surveyImpl.address, deployer],
    log: true,
    waitConfirmations: 1,
  });

  console.log(`✅ ConfidentialSurvey_Beacon deployed at: ${beacon.address}`);

  // Test beacon
  console.log("\n🧪 Testing Beacon...");
  try {
    const beaconContract = await hre.ethers.getContractAt(
      "ConfidentialSurvey_Beacon",
      beacon.address,
    );
    const implementation = await beaconContract.implementation();
    console.log(`✅ Beacon implementation: ${implementation}`);
    console.log(`✅ Beacon test passed!`);
  } catch (error) {
    console.log(`❌ Beacon test failed: ${error}`);
  }

  console.log("\n📋 Deployment Info:");
  console.log(`   Beacon: ${beacon.address}`);
  console.log(`   Implementation: ${surveyImpl.address}`);
  console.log(`   Owner: ${deployer}`);
};

export default func;
func.id = "deploy_survey_beacon";
func.tags = ["SurveyBeacon", "Beacon"];
func.dependencies = ["deploy_survey_implementation"];
