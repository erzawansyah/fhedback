import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploy ConfidentialSurvey_Direct - Direct implementation without proxy pattern
 * This script deploys a single survey contract directly without using factory or beacon patterns
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("\n=== Deploying ConfidentialSurvey_Direct ===");
  console.log(`Deployer: ${deployer}`);

  // Deploy the Direct Survey Implementation
  const directSurvey = await deploy("ConfidentialSurvey_Direct", {
    from: deployer,
    args: [
      deployer, // owner
      "DEMO", // symbol
      "QmExampleMetadataCID", // metadataCID (example IPFS CID)
      "QmExampleQuestionsCID", // questionsCID (example IPFS CID)
      5, // totalQuestions
      100, // respondentLimit
    ],
    log: true,
    gasLimit: 3000000, // Set explicit gas limit for deployment
  });

  console.log(
    `✅ ConfidentialSurvey_Direct deployed at: ${directSurvey.address}`,
  );
  console.log(`   - Owner: ${deployer}`);
  console.log(`   - Symbol: DEMO`);
  console.log(`   - Total Questions: 5`);
  console.log(`   - Respondent Limit: 100`);
  console.log(`   - Gas used: ${directSurvey.receipt?.gasUsed || "N/A"}`);

  // Verify the deployment
  if (directSurvey.newlyDeployed) {
    console.log("\n✅ ConfidentialSurvey_Direct successfully deployed!");
    console.log("\nNote: This is a direct deployment without proxy pattern.");
    console.log(
      "The contract is not upgradeable but simpler to interact with.",
    );

    // Add verification reminder
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n📝 To verify the contract, run:");
      console.log(
        `npx hardhat verify --network ${hre.network.name} ${directSurvey.address} "${deployer}" "DEMO" "QmExampleMetadataCID" "QmExampleQuestionsCID" 5 100`,
      );
    }
  }
};

export default func;
func.tags = ["ConfidentialSurvey_Direct", "direct"];
func.id = "deploy_confidential_survey_direct";
