import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("=== Deploying ConfidentialSurvey_Factory System ===");
  console.log("Deployer address:", deployer);

  // Get Beacon
  let beacon;
  try {
    beacon = await get("ConfidentialSurvey_Beacon");
  } catch {
    console.log(
      "❌ ConfidentialSurvey_Beacon not found. Deploy it first with:",
    );
    console.log("   npx hardhat deploy --tags SurveyBeacon");
    throw new Error("ConfidentialSurvey_Beacon not deployed");
  }

  console.log(`📋 Using Beacon: ${beacon.address}`);

  // 1. Deploy Factory Implementation
  console.log("\n🚀 Step 1: Deploying Factory Implementation...");
  const factoryImpl = await deploy("ConfidentialSurvey_Factory", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ Factory Implementation: ${factoryImpl.address}`);

  // 2. Deploy ProxyAdmin
  console.log("\n🚀 Step 2: Deploying ProxyAdmin...");
  const proxyAdmin = await deploy("ProxyAdmin", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ ProxyAdmin: ${proxyAdmin.address}`);

  // 3. Prepare initialization data
  console.log("\n🚀 Step 3: Preparing initialization data...");
  const factoryInterface = new hre.ethers.Interface([
    "function initialize(address _beacon, address _owner)",
  ]);
  const initData = factoryInterface.encodeFunctionData("initialize", [
    beacon.address,
    deployer,
  ]);

  // 4. Deploy TransparentUpgradeableProxy
  console.log("\n🚀 Step 4: Deploying Factory Proxy...");
  const factoryProxy = await deploy("TransparentUpgradeableProxy", {
    from: deployer,
    args: [
      factoryImpl.address, // implementation
      proxyAdmin.address, // admin
      initData, // initialization data
    ],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ Factory Proxy: ${factoryProxy.address}`);

  // Test factory
  console.log("\n🧪 Testing Factory...");
  try {
    const factory = await hre.ethers.getContractAt(
      "ConfidentialSurvey_Factory",
      factoryProxy.address,
    );
    const beaconAddress = await factory.getBeacon();
    const currentImpl = await factory.getCurrentImplementation();

    console.log(`✅ Factory beacon: ${beaconAddress}`);
    console.log(`✅ Current implementation: ${currentImpl}`);
    console.log(`✅ Factory test passed!`);

    // Test survey creation
    console.log("\n🧪 Testing Survey Creation...");
    const tx = await factory.createSurvey(
      deployer,
      "TEST01",
      "QmTestMetadataCID123",
      "QmTestQuestionsCID456",
      5,
      100,
    );
    await tx.wait();

    const totalSurveys = await factory.totalSurveys();
    const testSurveyAddress = await factory.surveys(totalSurveys - 1n);
    console.log(`✅ Test survey created at: ${testSurveyAddress}`);
  } catch (error) {
    console.log(`❌ Factory test failed: ${error}`);
  }

  console.log("\n📋 Factory Deployment Summary:");
  console.log(`   ├─ Beacon: ${beacon.address}`);
  console.log(`   ├─ Factory Implementation: ${factoryImpl.address}`);
  console.log(`   ├─ Factory Proxy: ${factoryProxy.address}`);
  console.log(`   └─ ProxyAdmin: ${proxyAdmin.address}`);
};

export default func;
func.id = "deploy_factory";
func.tags = ["Factory"];
func.dependencies = ["deploy_survey_beacon"];
