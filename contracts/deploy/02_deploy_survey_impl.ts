import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("=== Deploying ConfidentialSurvey Implementation ===");
  console.log("Deployer address:", deployer);

  // Deploy ConfidentialSurvey Implementation
  const surveyImpl = await deploy("ConfidentialSurvey", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log(
    `✅ ConfidentialSurvey Implementation deployed at: ${surveyImpl.address}`,
  );

  // Save deployment info
  console.log("\n📋 Deployment Info:");
  console.log(`   Implementation: ${surveyImpl.address}`);
  console.log(`   Transaction Hash: ${surveyImpl.transactionHash}`);
  console.log(`   Block Number: ${surveyImpl.receipt?.blockNumber}`);
};

export default func;
func.id = "deploy_survey_implementation";
func.tags = ["SurveyImpl", "Implementation"];
