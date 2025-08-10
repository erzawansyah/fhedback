import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("=== Deploying Complete ConfidentialSurvey System ===");
  console.log("Deployer address:", deployer);

  // 1. Deploy ConfidentialSurvey Implementation
  console.log("\n🚀 Step 1: Deploying ConfidentialSurvey Implementation...");
  const surveyImpl = await deploy("ConfidentialSurvey", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ ConfidentialSurvey Implementation: ${surveyImpl.address}`);

  // 2. Deploy ConfidentialSurvey_Beacon
  console.log("\n🚀 Step 2: Deploying ConfidentialSurvey_Beacon...");
  const beacon = await deploy("ConfidentialSurvey_Beacon", {
    from: deployer,
    args: [surveyImpl.address, deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ ConfidentialSurvey_Beacon: ${beacon.address}`);

  // 3. Deploy ConfidentialSurvey_Factory Implementation
  console.log(
    "\n🚀 Step 3: Deploying ConfidentialSurvey_Factory Implementation...",
  );
  const factoryImpl = await deploy("ConfidentialSurvey_Factory", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(
    `✅ ConfidentialSurvey_Factory Implementation: ${factoryImpl.address}`,
  );

  // 4. Deploy ProxyAdmin for Factory
  console.log("\n🚀 Step 4: Deploying ProxyAdmin...");
  const proxyAdmin = await deploy("ProxyAdmin", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ ProxyAdmin: ${proxyAdmin.address}`);

  // 5. Deploy TransparentUpgradeableProxy for Factory
  console.log("\n🚀 Step 5: Deploying Factory Proxy...");
  const factoryInterface = new hre.ethers.Interface([
    "function initialize(address _beacon, address _owner)",
  ]);
  const initData = factoryInterface.encodeFunctionData("initialize", [
    beacon.address,
    deployer,
  ]);

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
  console.log(`✅ ConfidentialSurvey_Factory Proxy: ${factoryProxy.address}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`📋 Contract Addresses:`);
  console.log(`   ├─ ConfidentialSurvey Implementation: ${surveyImpl.address}`);
  console.log(`   ├─ ConfidentialSurvey_Beacon: ${beacon.address}`);
  console.log(
    `   ├─ ConfidentialSurvey_Factory Implementation: ${factoryImpl.address}`,
  );
  console.log(
    `   ├─ ConfidentialSurvey_Factory Proxy: ${factoryProxy.address}`,
  );
  console.log(`   └─ ProxyAdmin: ${proxyAdmin.address}`);

  // Test factory deployment
  console.log("\n🧪 Testing Factory Deployment...");
  try {
    const factory = await hre.ethers.getContractAt(
      "ConfidentialSurvey_Factory",
      factoryProxy.address,
    );
    const beaconAddress = await factory.getBeacon();
    console.log(`✅ Factory beacon address: ${beaconAddress}`);
    console.log(`✅ Factory deployment test passed!`);
  } catch (error) {
    console.log(`❌ Factory deployment test failed: ${error}`);
  }
};

export default func;
func.id = "deploy_all_contracts";
func.tags = ["All", "Deploy"];
