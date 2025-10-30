import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, dirname } from "path";

interface CopyConfig {
  contractsDir: string;
  frontendDir: string;
  networkName: string;
}

async function copyContractInfoToFrontend(config: CopyConfig) {
  const { contractsDir, frontendDir, networkName } = config;

  // Source paths
  const sourceNetworkDir = join(contractsDir, "generated", networkName);
  const sourcePath = {
    addresses: join(sourceNetworkDir, "addresses.json"),
    networkInfo: join(sourceNetworkDir, "network-info.json"),
    contracts: join(sourceNetworkDir, "contracts.ts"),
    abis: sourceNetworkDir,
  };

  // Target paths
  const targetDir = join(frontendDir, "src", "constants", "contracts");
  const targetNetworkDir = join(targetDir, networkName);
  const targetPath = {
    addresses: join(targetNetworkDir, "addresses.json"),
    networkInfo: join(targetNetworkDir, "network-info.json"),
    contracts: join(targetNetworkDir, "contracts.ts"),
    abis: join(targetNetworkDir, "abis"),
  };

  console.log(
    `📋 Copying contract info to frontend for network: ${networkName}`,
  );
  console.log(`   Source: ${sourceNetworkDir}`);
  console.log(`   Target: ${targetNetworkDir}`);

  // Check if source exists
  if (!existsSync(sourceNetworkDir)) {
    throw new Error(
      `Source directory not found: ${sourceNetworkDir}. Please run contract generation first.`,
    );
  }

  // Create target directories
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  if (!existsSync(targetNetworkDir)) {
    mkdirSync(targetNetworkDir, { recursive: true });
  }
  if (!existsSync(targetPath.abis)) {
    mkdirSync(targetPath.abis, { recursive: true });
  }

  // Copy main files
  console.log(`📄 Copying main files...`);

  if (existsSync(sourcePath.addresses)) {
    copyFileSync(sourcePath.addresses, targetPath.addresses);
    console.log(`   ✅ Addresses: ${targetPath.addresses}`);
  }

  if (existsSync(sourcePath.networkInfo)) {
    copyFileSync(sourcePath.networkInfo, targetPath.networkInfo);
    console.log(`   ✅ Network Info: ${targetPath.networkInfo}`);
  }

  if (existsSync(sourcePath.contracts)) {
    copyFileSync(sourcePath.contracts, targetPath.contracts);
    console.log(`   ✅ TypeScript: ${targetPath.contracts}`);
  }

  // Copy ABI files
  console.log(`📄 Copying ABI files...`);
  const sourceFiles = readdirSync(sourceNetworkDir);
  const abiFiles = sourceFiles.filter((file) => file.endsWith(".abi.json"));

  for (const abiFile of abiFiles) {
    const sourceAbiPath = join(sourceNetworkDir, abiFile);
    const targetAbiPath = join(targetPath.abis, abiFile);
    copyFileSync(sourceAbiPath, targetAbiPath);
    console.log(`   ✅ ABI: ${targetAbiPath}`);
  }

  // Generate index file for easy imports
  console.log(`📄 Generating index files...`);
  await generateIndexFiles(targetNetworkDir, networkName, abiFiles);

  // Update main constants index
  await updateMainConstantsIndex(targetDir, networkName);

  console.log(`🎉 Contract info copied successfully to frontend!`);
  return {
    sourceDir: sourceNetworkDir,
    targetDir: targetNetworkDir,
    copiedFiles: {
      addresses: targetPath.addresses,
      networkInfo: targetPath.networkInfo,
      contracts: targetPath.contracts,
      abis: abiFiles.map((file) => join(targetPath.abis, file)),
    },
  };
}

async function generateIndexFiles(
  networkDir: string,
  networkName: string,
  abiFiles: string[],
) {
  // Generate network-specific index
  const networkIndexContent = `// Auto-generated index for ${networkName} contracts
// Generated on: ${new Date().toISOString()}

export * from './contracts';
export { default as addresses } from './addresses.json';
export { default as networkInfo } from './network-info.json';

// ABI exports
${abiFiles
  .map((file) => {
    const contractName = file.replace(".abi.json", "");
    return `export { default as ${contractName}ABI } from './abis/${file}';`;
  })
  .join("\n")}
`;

  const networkIndexPath = join(networkDir, "index.ts");
  writeFileSync(networkIndexPath, networkIndexContent);
  console.log(`   ✅ Network Index: ${networkIndexPath}`);

  // Generate ABIs index
  const abisIndexContent = `// Auto-generated ABI exports for ${networkName}
// Generated on: ${new Date().toISOString()}

${abiFiles
  .map((file) => {
    const contractName = file.replace(".abi.json", "");
    return `export { default as ${contractName}ABI } from './${file}';`;
  })
  .join("\n")}
`;

  const abisIndexPath = join(networkDir, "abis", "index.ts");
  writeFileSync(abisIndexPath, abisIndexContent);
  console.log(`   ✅ ABIs Index: ${abisIndexPath}`);
}

async function updateMainConstantsIndex(
  constantsDir: string,
  networkName: string,
) {
  const indexPath = join(constantsDir, "index.ts");

  // Read existing content or create new
  let content = "";
  if (existsSync(indexPath)) {
    content = readFileSync(indexPath, "utf-8");
  }

  // Check if network export already exists
  const exportLine = `export * as ${networkName} from './${networkName}';`;

  if (!content.includes(exportLine)) {
    // Add header if file is new
    if (!content.trim()) {
      content = `// Contract constants and ABIs for all networks
// Auto-generated - DO NOT EDIT MANUALLY

`;
    }

    content += `${exportLine}\n`;
    writeFileSync(indexPath, content);
    console.log(`   ✅ Updated main index: ${indexPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const networkName = args[0] || "sepolia";

  const config: CopyConfig = {
    contractsDir: process.cwd(),
    frontendDir: join(process.cwd(), "..", "frontend"),
    networkName,
  };

  copyContractInfoToFrontend(config)
    .then((result) => {
      console.log(`\n📊 Summary:`);
      console.log(`   Network: ${networkName}`);
      console.log(`   Source: ${result.sourceDir}`);
      console.log(`   Target: ${result.targetDir}`);
      console.log(
        `   Files: ${Object.keys(result.copiedFiles).length} categories copied`,
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error copying contract info to frontend:", error);
      process.exit(1);
    });
}

export { copyContractInfoToFrontend, CopyConfig };
