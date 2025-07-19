# FHEVM Questionnaire Contracts

This repository contains the smart contracts for a privacy-preserving questionnaire system powered by Zama's FHEVM on the Zama testnet.

## Overview

A fully homomorphic encrypted questionnaire that keeps survey responses encrypted on-chain while allowing statistical computations such as average and standard deviation to be performed in a privacy-preserving manner.

## Contracts

- **QuestionnaireFactory**: Factory contract to deploy new questionnaires.
- **Questionnaire**: Standard questionnaire contract without homomorphic encryption.
- **FHEQuestionnaire**: Main FHE-powered questionnaire contract.

## Initial Deployed Addresses (Sepolia Testnet)

- **QuestionnaireFactory**: `0x411E6Ed15706e6873fD2410974CEdcF10fc5C19a`
- **Questionnaire**: `0x8d24b4d9b092826fc197297228e0eed34a51a2db`
- **FHEQuestionnaire**: `0x05d66455d1aa858e5216714a7eca6db291b5ecb1`

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
