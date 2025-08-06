import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ContractInfo {
  path: string;
  name: string;
  relativePath: string;
}

function generateTypesForContract(
  artifactPath: string,
  contractName: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Normalize path for cross-platform compatibility
    const normalizedPath = artifactPath.replace(/\\/g, "/");
    const command = `npx typechain --target ethers-v6 --out-dir types "${normalizedPath}"`;

    exec(command, (error, stdout, _stderr) => {
      if (error) {
        console.error(`Error generating types for ${contractName}:`, error);
        reject(error);
      } else {
        console.log(`✅ Generated types for ${contractName}`);
        resolve(stdout);
      }
    });
  });
}

function findAllContractArtifacts(artifactsDir: string): ContractInfo[] {
  const contracts: ContractInfo[] = [];

  function scanDirectory(dir: string, basePath: string = "") {
    if (!fs.existsSync(dir)) {
      return;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip system directories
        if (
          item === "node_modules" ||
          item === "build-info" ||
          item.startsWith("@")
        ) {
          continue;
        }
        const newBasePath = basePath ? `${basePath}/${item}` : item;
        scanDirectory(fullPath, newBasePath);
      } else if (item.endsWith(".json") && !item.endsWith(".dbg.json")) {
        // This is a contract artifact JSON file
        const contractName = path.basename(item, ".json");
        const relativePath = basePath
          ? `${basePath}/${contractName}`
          : contractName;

        contracts.push({
          path: fullPath,
          name: contractName,
          relativePath,
        });
      }
    }
  }

  scanDirectory(artifactsDir);
  return contracts;
}

function cleanupTypesDirectory() {
  const typesDir = "./types";
  if (fs.existsSync(typesDir)) {
    console.log("🧹 Cleaning up existing types directory...");
    fs.rmSync(typesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(typesDir, { recursive: true });
}

async function generateAllTypes(): Promise<void> {
  console.log("🔧 Generating TypeChain types...");

  try {
    const artifactsDir = "./artifacts/contracts";
    const contracts = findAllContractArtifacts(artifactsDir);

    if (contracts.length === 0) {
      console.log(
        "⚠️  No contract artifacts found. Make sure to compile contracts first.",
      );
      console.log(`   Looking in: ${path.resolve(artifactsDir)}`);
      console.log("   Run: npm run compile");
      return;
    }

    console.log(`📄 Found ${contracts.length} contract(s):`);
    contracts.forEach((contract) => {
      console.log(`   - ${contract.name} (${contract.relativePath})`);
    });

    // Clean up existing types
    cleanupTypesDirectory();

    // Generate types for all contracts
    let successCount = 0;
    for (const contract of contracts) {
      try {
        await generateTypesForContract(contract.path, contract.name);
        successCount++;
      } catch (error) {
        console.error(
          `❌ Failed to generate types for ${contract.name}:`,
          (error as Error).message,
        );
      }
    }

    console.log(
      `🎉 Generated types for ${successCount}/${contracts.length} contracts successfully!`,
    );
    if (successCount > 0) {
      console.log(`📁 Types available in: ${path.resolve("./types")}`);
      console.log(
        `💡 Import types: import { ${contracts[0].name}__factory } from './types';`,
      );
    }
  } catch (error) {
    console.error("❌ Failed to generate types:", (error as Error).message);
    process.exit(1);
  }
}

void generateAllTypes();
