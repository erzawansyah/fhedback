import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { network, deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface ContractInfo {
  name: string;
  address: string;
  abi: any[];
  network: string;
  chainId: number;
  deploymentTimestamp: number;
  transactionHash?: string;
}

interface NetworkInfo {
  name: string;
  chainId: number;
  contracts: ContractInfo[];
  lastUpdated: number;
}

async function generateContractInfo() {
  console.log(`🔄 Generating contract info for network: ${network.name}`);

  // Get network info
  const chainId = network.config.chainId || 0;
  const networkName = network.name;

  // Create output directories
  const outputDir = join(process.cwd(), "generated");
  const networkDir = join(outputDir, networkName);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  if (!existsSync(networkDir)) {
    mkdirSync(networkDir, { recursive: true });
  }

  // Get all deployments
  const allDeployments = await deployments.all();
  const contracts: ContractInfo[] = [];

  console.log(
    `📋 Found ${Object.keys(allDeployments).length} deployed contracts`,
  );

  // Process each deployment
  for (const [contractName, deployment] of Object.entries(allDeployments)) {
    const contractInfo: ContractInfo = {
      name: contractName,
      address: deployment.address,
      abi: deployment.abi,
      network: networkName,
      chainId: chainId,
      deploymentTimestamp: deployment.receipt?.blockNumber
        ? Date.now() // We could get actual block timestamp but this is simpler
        : Date.now(),
      transactionHash: deployment.transactionHash,
    };

    contracts.push(contractInfo);

    // Generate individual contract files
    console.log(`📝 Generating files for ${contractName}...`);

    // 1. ABI file
    const abiPath = join(networkDir, `${contractName}.abi.json`);
    writeFileSync(abiPath, JSON.stringify(deployment.abi, null, 2));

    // 2. Contract info file
    const infoPath = join(networkDir, `${contractName}.info.json`);
    writeFileSync(infoPath, JSON.stringify(contractInfo, null, 2));

    console.log(`   ✅ ABI: ${abiPath}`);
    console.log(`   ✅ Info: ${infoPath}`);
  }

  // Generate network summary
  const networkInfo: NetworkInfo = {
    name: networkName,
    chainId: chainId,
    contracts: contracts,
    lastUpdated: Date.now(),
  };

  const networkSummaryPath = join(networkDir, "network-info.json");
  writeFileSync(networkSummaryPath, JSON.stringify(networkInfo, null, 2));

  // Generate addresses-only file (for easy import)
  const addresses = contracts.reduce(
    (acc, contract) => {
      acc[contract.name] = contract.address;
      return acc;
    },
    {} as Record<string, string>,
  );

  const addressesPath = join(networkDir, "addresses.json");
  writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  // Generate TypeScript constants file
  const tsContent = generateTSConstants(contracts, networkName, chainId);
  const tsPath = join(networkDir, "contracts.ts");
  writeFileSync(tsPath, tsContent);

  // Generate environment file
  const envContent = generateEnvFile(contracts, networkName);
  const envPath = join(networkDir, ".env.contracts");
  writeFileSync(envPath, envContent);

  console.log(`\n📊 Generated contract information:`);
  console.log(`   📁 Directory: ${networkDir}`);
  console.log(`   📄 Network Summary: ${networkSummaryPath}`);
  console.log(`   📄 Addresses: ${addressesPath}`);
  console.log(`   📄 TypeScript: ${tsPath}`);
  console.log(`   📄 Environment: ${envPath}`);
  console.log(`\n🎉 Contract info generation completed!`);

  return {
    networkInfo,
    outputDir: networkDir,
    files: {
      networkSummary: networkSummaryPath,
      addresses: addressesPath,
      typescript: tsPath,
      environment: envPath,
    },
  };
}

function generateTSConstants(
  contracts: ContractInfo[],
  networkName: string,
  chainId: number,
): string {
  const addressConstants = contracts
    .map(
      (contract) =>
        `export const ${contract.name.toUpperCase()}_ADDRESS = "${contract.address}" as const;`,
    )
    .join("\n");

  const abiImports = contracts
    .map(
      (contract) =>
        `export { default as ${contract.name}ABI } from './${contract.name}.abi.json';`,
    )
    .join("\n");

  return `// Generated contract constants for ${networkName} (Chain ID: ${chainId})
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - This file is auto-generated

// Network Info
export const NETWORK_NAME = "${networkName}" as const;
export const CHAIN_ID = ${chainId} as const;

// Contract Addresses
${addressConstants}

// Contract ABIs
${abiImports}

// All addresses object
export const CONTRACT_ADDRESSES = {
${contracts.map((contract) => `  ${contract.name}: ${contract.name.toUpperCase()}_ADDRESS,`).join("\n")}
} as const;

// Contract info with ABIs
export const CONTRACT_INFO = {
${contracts
  .map(
    (contract) => `  ${contract.name}: {
    address: ${contract.name.toUpperCase()}_ADDRESS,
    abi: ${contract.name}ABI,
  },`,
  )
  .join("\n")}
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddress = typeof CONTRACT_ADDRESSES[ContractName];
`;
}

function generateEnvFile(
  contracts: ContractInfo[],
  networkName: string,
): string {
  const envVars = contracts
    .map(
      (contract) =>
        `${networkName.toUpperCase()}_${contract.name.toUpperCase()}_ADDRESS=${contract.address}`,
    )
    .join("\n");

  return `# Generated environment variables for ${networkName}
# Generated on: ${new Date().toISOString()}
# DO NOT EDIT MANUALLY - This file is auto-generated

${envVars}

# Network info
${networkName.toUpperCase()}_NETWORK_NAME=${networkName}
${networkName.toUpperCase()}_CHAIN_ID=${network.config.chainId || 0}
`;
}

// Export for use in other scripts
export { generateContractInfo, ContractInfo, NetworkInfo };

// Run if called directly
if (require.main === module) {
  generateContractInfo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error generating contract info:", error);
      process.exit(1);
    });
}
