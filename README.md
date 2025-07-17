# FHEVM Questionnaire Contracts

This repository contains the smart contracts for a privacy-preserving questionnaire system powered by Zama's FHEVM on the Zama testnet.

## Overview

A fully homomorphic encrypted questionnaire that keeps survey responses encrypted on-chain while allowing statistical computations such as average and standard deviation to be performed in a privacy-preserving manner.

## Contracts

- **QuestionnaireFactory**: Factory contract to deploy new questionnaires.
- **Questionnaire**: Standard questionnaire contract without homomorphic encryption.
- **FHEQuestionnaire**: Main FHE-powered questionnaire contract.

## Initial Deployed Addresses (Sepolia Testnet)

- **QuestionnaireFactory**: `0x4F8e940DdE65f95F3896E983240a3Be674Ad1854`
- **Questionnaire**: `0x6f14f236474b711ea62c03c02bcfdcb5baa1e9e1`
- **FHEQuestionnaire**: `0x4d7c43ed897a884ba7375458489da532fe2e3250`

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
