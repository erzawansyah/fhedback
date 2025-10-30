import { ethers } from "hardhat";
import { vars } from "hardhat/config";

async function main() {
  console.log("=== Testing Deployed Factory on Sepolia ===");

  const factoryAddress = "0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04";
  console.log(`Factory Address: ${factoryAddress}`);

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  // Connect to deployed factory
  const factory = await ethers.getContractAt(
    "ConfidentialSurvey_Factory",
    factoryAddress,
  );

  // Check factory status
  console.log("\n📊 Factory Status:");
  const owner = await factory.owner();
  const totalSurveys = await factory.totalSurveys();
  console.log(`   Owner: ${owner}`);
  console.log(`   Total Surveys: ${totalSurveys}`);

  // Create a test survey
  console.log("\n🚀 Creating Test Survey...");
  const tx = await factory.createSurvey(
    deployer.address, // owner
    "TEST01", // symbol
    "QmTestMetadataCID123", // metadataCID
    "QmTestQuestionsCID456", // questionsCID
    5, // totalQuestions
    100, // respondentLimit
  );

  console.log(`   Transaction Hash: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`   Gas Used: ${receipt?.gasUsed}`);

  // Check updated status
  const newTotalSurveys = await factory.totalSurveys();
  const surveyAddress = await factory.surveys(0);

  console.log("\n📋 Survey Created:");
  console.log(`   Total Surveys: ${newTotalSurveys}`);
  console.log(`   Survey Address: ${surveyAddress}`);
  console.log(
    `   Survey Link: https://eth-sepolia.blockscout.com/address/${surveyAddress}`,
  );

  // Get survey details
  const survey = await ethers.getContractAt(
    "ConfidentialSurvey",
    surveyAddress,
  );
  const surveyDetails = await survey.getSurvey();

  console.log("\n📝 Survey Details:");
  console.log(`   Owner: ${surveyDetails.owner}`);
  console.log(`   Symbol: ${surveyDetails.symbol}`);
  console.log(
    `   Status: ${surveyDetails.status} (0=Created, 1=Active, 2=Closed, 3=Trashed)`,
  );
  console.log(`   Total Questions: ${surveyDetails.totalQuestions}`);
  console.log(`   Respondent Limit: ${surveyDetails.respondentLimit}`);

  console.log("\n✅ Factory test completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
