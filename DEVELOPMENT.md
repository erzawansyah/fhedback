# Development Workflow

## Compile Contracts & Generate Types

```bash
# Compile contracts and auto-generate TypeChain types
npm run compile

# Force clean + compile + types generation
npm run compile:force

# Only generate TypeChain types (if artifacts already exist)
npm run typechain

# Clean and regenerate only types
npm run typechain:clean

# Clean everything (artifacts, types, cache, etc.)
npm run clean
```

## TypeChain Types Usage

After running `npm run compile`, you can import and use contract types:

```typescript
import { ConfidentialSurvey__factory, TestContract__factory } from "./types";
import { ethers } from "hardhat";

// Deploy contract
const [deployer] = await ethers.getSigners();
const surveyFactory = new ConfidentialSurvey__factory(deployer);
const survey = await surveyFactory.deploy(/* constructor args */);

// Get contract instance
const contractAddress = "0x...";
const surveyContract = ConfidentialSurvey__factory.connect(
  contractAddress,
  deployer,
);
```

## Auto-Detection

The TypeChain generation script automatically detects all contracts in `artifacts/contracts/` directory, so when you add new contracts, they will automatically be included in the next compilation.

## Scripts Overview

- `npm run compile` - Compile contracts + generate types
- `npm run clean` - Clean all build artifacts including types
- `npm run typechain` - Generate TypeChain types only
- `npm run test` - Run tests
- `npm run lint` - Run all linting (Solidity + TypeScript)
