import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(
    "=== Deploying ConfidentialSurvey Factory System (Direct Implementation) ===",
  );
  console.log("Deployer address:", deployer);

  // 1. Deploy ConfidentialSurvey_Factory Implementation
  console.log(
    "\n🚀 Step 1: Deploying ConfidentialSurvey_Factory Implementation...",
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

  // 2. Deploy ProxyAdmin for Factory
  console.log("\n🚀 Step 2: Deploying ProxyAdmin...");
  const proxyAdmin = await deploy("ProxyAdmin", {
    from: deployer,
    args: [deployer], // Pass deployer as initial owner
    log: true,
    waitConfirmations: 1,
    contract: "contracts/ProxyAdmin.sol:ProxyAdmin", // Use fully qualified name
  });
  console.log(`✅ ProxyAdmin: ${proxyAdmin.address}`);

  // 3. Deploy TransparentUpgradeableProxy for Factory
  console.log("\n🚀 Step 3: Deploying Factory Proxy...");
  const factoryInterface = new hre.ethers.Interface([
    "function initialize(address _owner)",
  ]);
  const initData = factoryInterface.encodeFunctionData("initialize", [
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
    contract:
      "contracts/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy", // Use fully qualified name
  });
  console.log(`✅ ConfidentialSurvey_Factory Proxy: ${factoryProxy.address}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`📋 Contract Addresses:`);
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
    const totalSurveys = await factory.totalSurveys();
    console.log(`✅ Factory total surveys: ${totalSurveys}`);
    console.log(`✅ Factory deployment test passed!`);
  } catch (error) {
    console.log(`❌ Factory deployment test failed: ${error}`);
  }
};

export default func;
func.id = "deploy_all_contracts";
func.tags = ["All", "Deploy"];
