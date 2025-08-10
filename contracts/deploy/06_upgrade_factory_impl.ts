import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("=== Upgrading ConfidentialSurvey_Factory Implementation ===");
  console.log("Deployer address:", deployer);

  // Get existing deployments
  let factoryProxy, proxyAdmin;
  try {
    factoryProxy = await get("TransparentUpgradeableProxy");
    proxyAdmin = await get("ProxyAdmin");
  } catch {
    console.log("❌ Factory system not found. Deploy the system first.");
    throw new Error("Factory not deployed");
  }

  console.log(`📋 Factory Proxy: ${factoryProxy.address}`);
  console.log(`📋 ProxyAdmin: ${proxyAdmin.address}`);

  // Get current implementation through ProxyAdmin
  const proxyAdminContract = await hre.ethers.getContractAt(
    "ProxyAdmin",
    proxyAdmin.address,
  );
  const oldImplementation = await proxyAdminContract.getProxyImplementation(
    factoryProxy.address,
  );
  console.log(`📋 Current Implementation: ${oldImplementation}`);

  // Deploy new factory implementation
  console.log("\n🚀 Deploying New Factory Implementation...");
  const newFactoryImpl = await deploy("ConfidentialSurvey_Factory", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ New Factory Implementation: ${newFactoryImpl.address}`);

  // Upgrade proxy through ProxyAdmin
  console.log("\n🔄 Upgrading Factory Proxy Implementation...");
  try {
    const upgradeTx = await proxyAdminContract.upgrade(
      factoryProxy.address,
      newFactoryImpl.address,
    );
    await upgradeTx.wait();
    console.log(`✅ Factory upgraded successfully!`);

    // Verify upgrade
    const currentImplementation =
      await proxyAdminContract.getProxyImplementation(factoryProxy.address);
    console.log(`✅ Current Implementation: ${currentImplementation}`);

    if (
      currentImplementation.toLowerCase() ===
      newFactoryImpl.address.toLowerCase()
    ) {
      console.log(`✅ Upgrade verification passed!`);
    } else {
      console.log(`❌ Upgrade verification failed!`);
    }
  } catch (error) {
    console.log(`❌ Upgrade failed: ${error}`);
    throw error;
  }

  // Test upgraded factory
  console.log("\n🧪 Testing Upgraded Factory...");
  try {
    const factory = await hre.ethers.getContractAt(
      "ConfidentialSurvey_Factory",
      factoryProxy.address,
    );
    const beaconAddress = await factory.getBeacon();
    const totalSurveys = await factory.totalSurveys();

    console.log(`✅ Factory beacon: ${beaconAddress}`);
    console.log(`✅ Total surveys: ${totalSurveys}`);
    console.log(`✅ Factory functionality test passed!`);
  } catch (error) {
    console.log(`❌ Factory test failed: ${error}`);
  }

  console.log("\n📋 Upgrade Summary:");
  console.log(`   ├─ Factory Proxy: ${factoryProxy.address}`);
  console.log(`   ├─ ProxyAdmin: ${proxyAdmin.address}`);
  console.log(`   ├─ Old Implementation: ${oldImplementation}`);
  console.log(`   └─ New Implementation: ${newFactoryImpl.address}`);

  console.log("\n💡 Note: Factory proxy now uses the new implementation!");
};

export default func;
func.id = "upgrade_factory_implementation";
func.tags = ["UpgradeFactory", "Upgrade"];
