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

### 📋 Sepolia Testnet Deployment (VERIFIED ✅)
   ├─ **ConfidentialSurvey Implementation**: [`0xb213a72EfF95D042112a13Ea749094a7624F7e6A`](https://eth-sepolia.blockscout.com/address/0xb213a72EfF95D042112a13Ea749094a7624F7e6A#code)
   ├─ **ConfidentialSurvey_Beacon**: [`0xc08F37e971a3c752c77702bf63f78bbFc2C9Bf5F`](https://eth-sepolia.blockscout.com/address/0xc08F37e971a3c752c77702bf63f78bbFc2C9Bf5F#code)
   ├─ **ConfidentialSurvey_Factory Implementation**: [`0xe6EB51400def6B97C5cadb1984f701F3996152f0`](https://eth-sepolia.blockscout.com/address/0xe6EB51400def6B97C5cadb1984f701F3996152f0#code)
   ├─ **ConfidentialSurvey_Factory Proxy** (Main Interface): [`0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214`](https://eth-sepolia.blockscout.com/address/0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214#code)
   └─ **ProxyAdmin**: [`0x8b7bcBCee9de4134e553365499f206698A9fB434`](https://eth-sepolia.blockscout.com/address/0x8b7bcBCee9de4134e553365499f206698A9fB434#code)

> 🎯 **For Frontend Integration**: Use the **Factory Proxy** address `0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214` to interact with the system.

> 📋 All contracts are **verified** on Sepolia Blockscout. Click the links above to view source code.

Read the [deployment guide](./docs/DEPLOYMENTS.md) for detailed instructions.

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
