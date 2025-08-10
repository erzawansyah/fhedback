# FHEdback Contracts

This repository contains the smart contracts for a FHEdback, Confidential Survey Platform powered by Zama's FHEVM.

## Overview

FHEdback is a confidential survey platform that leverages Zama's Fully Homomorphic Encryption (FHE) technology to ensure privacy and security for users while collecting valuable feedback. This allows for the processing of encrypted data without exposing the underlying information.

### Features:
- **Confidentiality**: All survey responses are encrypted, ensuring user privacy.
- **Statistical Analysis**: Perform computations on encrypted data without decrypting it. (Coming Soon)
- **User-Friendly**: Intuitive interface for both survey creators and respondents.

## Contracts
This repository contains the smart contracts for the FHEdback platform.
📋 Contract Addresses:
   ├─ ConfidentialSurvey Implementation: `0x4DcC0712DFf9D89808b70911571f38F94B6a27b0`
   ├─ ConfidentialSurvey_Beacon: `0xed8B31AcBae5277bcf4Bc2D22A5FBc90848b89DA`
   ├─ ConfidentialSurvey_Factory Implementation: `0x840173e84fb36ada68CEb7EdBbF1E0C0eb01f677`
   ├─ ConfidentialSurvey_Factory Proxy: `0x94ffeb2bcBa5F58B4a0475721ED2a1304f3c37A3`
   └─ ProxyAdmin: `0x525a4bd9C46Ab1Dd2193E23e177dDa63aCA7518A`

Read the [deployment guide](./deploy/README.md) for detailed instructions.

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
