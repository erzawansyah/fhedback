import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { generateContractInfo } from "../scripts/generate-contract-info";
import { copyContractInfoToFrontend } from "../scripts/copy-to-frontend";
import { join } from "path";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(
    "=== Deploying ConfidentialSurvey Factory System (Direct Implementation) ===",
  );
  console.log("Deployer address:", deployer);

  // Deploy ConfidentialSurvey_Factory directly
  console.log("\n🚀 Deploying ConfidentialSurvey_Factory...");
  const factory = await deploy("ConfidentialSurvey_Factory", {
    from: deployer,
    args: [deployer], // Pass deployer as owner
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ ConfidentialSurvey_Factory: ${factory.address}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`📋 Contract Addresses:`);
  console.log(`   └─ ConfidentialSurvey_Factory: ${factory.address}`);

  // Test factory deployment
  console.log("\n🧪 Testing Factory Deployment...");
  try {
    const factoryContract = await hre.ethers.getContractAt(
      "ConfidentialSurvey_Factory",
      factory.address,
    );
    const totalSurveys = await factoryContract.totalSurveys();
    console.log(`✅ Factory total surveys: ${totalSurveys}`);
    console.log(`✅ Factory deployment test passed!`);
  } catch (error) {
    console.log(`❌ Factory deployment test failed: ${error}`);
  }

  // Generate contract information files
  console.log("\n📋 Generating contract information files...");
  try {
    await generateContractInfo();
    console.log(`✅ Contract information files generated successfully!`);
  } catch (error) {
    console.log(`❌ Failed to generate contract information: ${error}`);
  }

  // Copy to frontend (only for sepolia network)
  if (hre.network.name === "sepolia") {
    console.log("\n📋 Copying contract info to frontend...");
    try {
      await copyContractInfoToFrontend({
        contractsDir: process.cwd(),
        frontendDir: join(process.cwd(), "..", "frontend"),
        networkName: hre.network.name,
      });
      console.log(`✅ Contract info copied to frontend successfully!`);
    } catch (error) {
      console.log(`❌ Failed to copy to frontend: ${error}`);
    }
  }
};

export default func;
func.id = "deploy_all_contracts";
func.tags = ["All", "Deploy"];
