import fs from "fs";
import path from "path";

async function main() {
  // Get contract name from command line argument
  const contractName = process.argv[2];

  if (!contractName) {
    console.error("❌ Error: Contract name is required");
    console.log("\n💡 Usage:");
    console.log(
      "  npx hardhat run scripts/generate-contract-artifacts.ts ContractName"
    );
    console.log("\n📝 Examples:");
    console.log(
      "  npx hardhat run scripts/generate-contract-artifacts.ts MyContract"
    );
    console.log(
      "  npx hardhat run scripts/generate-contract-artifacts.ts Token"
    );
    console.log("  npx hardhat run scripts/generate-contract-artifacts.ts NFT");
    process.exit(1);
  }

  const contractPath = `contracts/${contractName}.sol`;
  const artifactPath = `artifacts/contracts/${contractName}.sol/${contractName}.json`;

  // Check if contract file exists
  if (!fs.existsSync(contractPath)) {
    console.error(`❌ Error: Contract file not found: ${contractPath}`);
    console.log("\n💡 Available contracts:");
    try {
      const contractFiles = fs
        .readdirSync("contracts")
        .filter((file) => file.endsWith(".sol"))
        .map((file) => file.replace(".sol", ""));

      if (contractFiles.length > 0) {
        contractFiles.forEach((name) => console.log(`  - ${name}`));
      } else {
        console.log("  No contracts found in contracts/ directory");
      }
    } catch (error) {
      console.log("  Cannot read contracts directory");
    }
    process.exit(1);
  }

  // Check if artifact exists (contract must be compiled first)
  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ Error: Artifact not found: ${artifactPath}`);
    console.log("\n💡 Run this command first:");
    console.log("  npx hardhat compile");
    process.exit(1);
  }

  // Create output directories
  const outputDirs = ["output", "output/abi", "output/json"];
  outputDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  try {
    console.log(`🚀 Generating artifacts for: ${contractName}`);

    // Read contract source code
    const contractSource = fs.readFileSync(contractPath, "utf8");

    // Read artifact file
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // === GENERATE ABI ===
    const abi = artifact.abi;

    // Save ABI to output/abi folder
    const abiPath = path.join("output/abi", `${contractName}-abi.json`);
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

    // Generate human-readable ABI
    const humanReadableAbi = abi.map((item: any) => {
      if (item.type === "function") {
        const inputs = item.inputs
          .map((input: any) => `${input.type} ${input.name}`)
          .join(", ");
        const outputs =
          item.outputs?.map((output: any) => output.type).join(", ") || "void";
        const stateMutability =
          item.stateMutability !== "nonpayable"
            ? ` ${item.stateMutability}`
            : "";
        return `function ${item.name}(${inputs})${stateMutability} returns (${outputs})`;
      } else if (item.type === "event") {
        const inputs = item.inputs
          .map((input: any) => {
            const indexed = input.indexed ? " indexed" : "";
            return `${input.type}${indexed} ${input.name}`;
          })
          .join(", ");
        return `event ${item.name}(${inputs})`;
      } else if (item.type === "constructor") {
        const inputs = item.inputs
          .map((input: any) => `${input.type} ${input.name}`)
          .join(", ");
        return `constructor(${inputs})`;
      } else if (item.type === "error") {
        const inputs = item.inputs
          .map((input: any) => `${input.type} ${input.name}`)
          .join(", ");
        return `error ${item.name}(${inputs})`;
      }
      return JSON.stringify(item);
    });

    const readableAbiPath = path.join(
      "output/abi",
      `${contractName}-abi-readable.txt`
    );
    fs.writeFileSync(readableAbiPath, humanReadableAbi.join("\n"));

    // === GENERATE STANDARD JSON INPUT ===
    const standardJsonInput = {
      language: "Solidity",
      sources: {
        [contractPath]: {
          content: contractSource,
        },
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata"],
          },
        },
      },
    };

    // Save standard JSON input to output/json folder
    const jsonInputPath = path.join(
      "output/json",
      `${contractName}-standard-input.json`
    );
    fs.writeFileSync(jsonInputPath, JSON.stringify(standardJsonInput, null, 2));

    // === GENERATE FULL CONTRACT INFO ===
    const fullContractInfo = {
      contractName: artifact.contractName,
      sourceName: artifact.sourceName,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
      linkReferences: artifact.linkReferences,
      deployedLinkReferences: artifact.deployedLinkReferences,
      metadata: artifact.metadata ? JSON.parse(artifact.metadata) : null,
    };

    const fullInfoPath = path.join(
      "output/json",
      `${contractName}-full-info.json`
    );
    fs.writeFileSync(fullInfoPath, JSON.stringify(fullContractInfo, null, 2));

    // === GENERATE MINIMAL JSON (for faster verification) ===
    const minimalJsonInput = {
      language: "Solidity",
      sources: {
        [contractPath]: {
          content: contractSource.replace(/\s+/g, " ").trim(),
        },
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };

    const minimalJsonPath = path.join(
      "output/json",
      `${contractName}-minimal-input.json`
    );
    fs.writeFileSync(minimalJsonPath, JSON.stringify(minimalJsonInput));

    // === GENERATE SOLIDITY INTERFACE ===
    let interfaceCode = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ninterface I${contractName} {\n`;

    for (const item of abi) {
      if (item.type === "function") {
        const inputs = item.inputs
          .map((input: any) => `${input.type} ${input.name}`)
          .join(", ");
        const outputs =
          item.outputs?.length > 0
            ? ` returns (${item.outputs
                .map((output: any) => output.type)
                .join(", ")})`
            : "";

        interfaceCode += `    function ${item.name}(${inputs}) external${outputs};\n`;
      } else if (item.type === "event") {
        const inputs = item.inputs
          .map((input: any) => {
            const indexed = input.indexed ? " indexed" : "";
            return `${input.type}${indexed} ${input.name}`;
          })
          .join(", ");

        interfaceCode += `    event ${item.name}(${inputs});\n`;
      }
    }

    interfaceCode += "}\n";

    const interfacePath = path.join("output", `I${contractName}.sol`);
    fs.writeFileSync(interfacePath, interfaceCode);

    // === SUMMARY OUTPUT ===
    console.log("\n🎉 === CONTRACT ARTIFACTS GENERATED ===");
    console.log(`📋 Contract: ${contractName}`);

    console.log("\n📁 ABI Files:");
    console.log(`  ✅ ${abiPath}`);
    console.log(`  ✅ ${readableAbiPath}`);

    console.log("\n📁 JSON Files:");
    console.log(`  ✅ ${jsonInputPath} (for Blockscout verification)`);
    console.log(`  ✅ ${minimalJsonPath} (minified version)`);
    console.log(`  ✅ ${fullInfoPath} (complete contract info)`);

    console.log("\n📁 Interface:");
    console.log(`  ✅ ${interfacePath}`);

    console.log("\n📊 Contract Stats:");
    console.log(
      `  🔧 Functions: ${
        abi.filter((item: any) => item.type === "function").length
      }`
    );
    console.log(
      `  📢 Events: ${abi.filter((item: any) => item.type === "event").length}`
    );
    console.log(
      `  🏗️  Constructor: ${
        abi.filter((item: any) => item.type === "constructor").length
      }`
    );
    console.log(
      `  ⚠️  Errors: ${abi.filter((item: any) => item.type === "error").length}`
    );

    console.log("\n💡 Usage:");
    console.log("  - Use standard-input.json for Blockscout verification");
    console.log("  - Use abi.json for frontend integration");
    console.log("  - Use interface.sol for other contracts");
  } catch (error) {
    console.error("❌ Error generating artifacts:", error);
    console.log("\n💡 Make sure to:");
    console.log("  1. Compile contracts first: npx hardhat compile");
    console.log("  2. Check contract name and path");
  }
}

main().catch(console.error);
