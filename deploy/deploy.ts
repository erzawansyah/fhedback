import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("=== Deploying Questionnaire Contracts ===");
  console.log("Deployer address:", deployer);

  // Deploy QuestionnaireFactory contract
  console.log("\n1. Deploying QuestionnaireFactory...");
  const deployedQuestionnaireFactory = await deploy("QuestionnaireFactory", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(
    `✅ QuestionnaireFactory deployed at: ${deployedQuestionnaireFactory.address}`,
  );

  // The individual Questionnaire and FHEQuestionnaire contracts will be deployed
  // through the factory when users create questionnaires, so we don't need to deploy them directly.

  console.log("\n=== Deployment Summary ===");
  console.log(`QuestionnaireFactory: ${deployedQuestionnaireFactory.address}`);
  console.log(
    "\nNote: Individual Questionnaire and FHEQuestionnaire contracts will be deployed",
  );
  console.log("through the factory when users create new questionnaires.");
};

export default func;
func.id = "deploy_questionnaire_contracts_new"; // id required to prevent reexecution
func.tags = ["QuestionnaireFactory", "Questionnaire"];
