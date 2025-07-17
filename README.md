# FHEVM Questionnaire Contracts

This repository contains the smart contracts for a privacy-preserving questionnaire system powered by Zama's FHEVM on the Zama testnet.

## Overview

A fully homomorphic encrypted questionnaire that keeps survey responses encrypted on-chain while allowing statistical computations such as average and standard deviation to be performed in a privacy-preserving manner.

## Contracts

- **QuestionnaireFactory**: Factory contract to deploy new questionnaires.
- **FHEQuestionnaire**: Main FHE-powered questionnaire contract.
- **Questionnaire**: Standard questionnaire contract without homomorphic encryption.

## Initial Deployed Addresses (Sepolia Testnet)

- **QuestionnaireFactory**: `0x1664D7F2E6E5af625F752cF2B49947A5F978AEab`
- **FHEQuestionnaire**: `0x848B0066793BcC60346Da1F49049357399B8D595`
- **Questionnaire**: `0xA1bB2c3D4e5F6a7B8C9d0E1F2a3B4C5D6E7F8G9H`

## Getting Started

```bash
# Install dependencies
npm install

# Compile contracts and generate TypeScript types
npm run compile

# Run all tests
npm run test

# Clean build artifacts
npm run clean

# Format code
npm run prettier:write

# Lint code
npm run lint
```

## Project Structure

```
contracts/       # Solidity contracts
deploy/          # Deployment scripts
test/            # Test suites for FHE and standard questionnaires
types/           # Auto-generated TypeChain types
tasks/           # Hardhat tasks (e.g., account utilities)
```

## License

MIT License
