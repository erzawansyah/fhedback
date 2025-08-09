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

## Contract Addresses

- **ConfidentialSurvey Implementation**: https://sepolia.etherscan.io/address/0x4DcC0712DFf9D89808b70911571f38F94B6a27b0
- **ConfidentialSurvey_Beacon**: https://sepolia.etherscan.io/address/0x53c4f990a52dFA045F2FfD288f6eeD22a26535C4
- **ConfidentialSurvey_Factory**: https://sepolia.etherscan.io/address/0x529c50514302984b4edc239646B6775e0375B569
