# FHEdback Contracts

This repository contains the smart contracts for a FHEdback, Confidential Survey Platform powered by Zama's FHEVM.

## Overview

FHEdback is a confidential survey platform that leverages Zama's Fully Homomorphic Encryption (FHE) technology to ensure privacy and security for users while collecting valuable feedback. This allows for the processing of encrypted data without exposing the underlying information.

### Features:
- **Confidentiality**: All survey responses are encrypted, ensuring user privacy.
- **Statistical Analysis**: Perform computations on encrypted data without decrypting it. (Coming Soon)
- **User-Friendly**: Intuitive interface for both survey creators and respondents.

## Contracts



- **Implementation Address** (_ConfidentialSurvey_): `0xc8d44fB79D9609D30AEb71f11761661d619beCB2`
- **Factory Address** (_ConfidentialSurvey_Factory_): `0x9F06047fEB154c68a3f176e37941E3804BF3713D`


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
