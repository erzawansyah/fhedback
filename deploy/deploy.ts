import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("=== Deploying ConfidentialSurvey Contract ===");
  console.log("Deployer address:", deployer);

  // Deploy ConfidentialSurvey contract
  console.log("\n1. Deploying ConfidentialSurvey...");
  const deployedConfidentialSurvey = await deploy("ConfidentialSurvey", {
    from: deployer,
    args: [
      deployer, // _owner
      "Test Survey", // _title
      "QmTestMetadataCID", // _metadataCID
      "QmTestQuestionsCID", // _questionsCID
      5, // _totalQuestions
      100, // _respondentLimit
    ],
    log: true,
    waitConfirmations: 1,
  });

  console.log(
    `✅ ConfidentialSurvey deployed at: ${deployedConfidentialSurvey.address}`,
  );

  console.log("\n=== Deployment Summary ===");
  console.log(`ConfidentialSurvey: ${deployedConfidentialSurvey.address}`);
};

export default func;
func.id = "deploy_confidential_survey"; // id required to prevent reexecution
func.tags = ["ConfidentialSurvey"];
