# FHEdback Smart Contracts Integration

This directory contains everything needed to integrate with FHEdback smart contracts in your frontend application.

## 📋 Current Deployment Status

**✅ Sepolia Testnet (LIVE & VERIFIED)**  
**Updated**: September 1, 2025  
**Status**: All contracts deployed and verified on Blockscout  

### Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| **Factory Proxy** 🎯 | `0xeD772f032bB500F55ed715781CcABff4625Cc5C8` | **Main contract for frontend** |
| Factory Implementation | `0x95a37bc1148a2Dba364865926863f06B828e5FE4` | Factory logic |
| Proxy Admin | `0x8b7bcBCee9de4134e553365499f206698A9fB434` | Admin control |

> 🎯 **For Frontend**: Always use the **Factory Proxy** address `0xeD772f032bB500F55ed715781CcABff4625Cc5C8`

## 🚀 Quick Start

### 1. Import Contracts
```typescript
import { 
  FACTORY_ADDRESS, 
  ABIS, 
  NETWORK_CONFIG 
} from '@/services/contracts';
```

### 2. Initialize Factory Contract
```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const factory = new ethers.Contract(FACTORY_ADDRESS, ABIS.factory, provider);
```

### 3. Create a Survey
```typescript
const signer = await provider.getSigner();
const factoryWithSigner = new ethers.Contract(FACTORY_ADDRESS, ABIS.factory, signer);

const tx = await factoryWithSigner.createSurvey(
  ownerAddress,      // Survey owner
  "SURVEY01",        // Symbol
  "QmMetadataHash",  // Metadata IPFS hash
  "QmQuestionsHash", // Questions IPFS hash  
  5,                 // Total questions
  100                // Respondent limit
);
await tx.wait();
  "QmQuestionsHash", // Questions IPFS hash
  5,                 // Rating scale (1-5)
  100               // Max respondents
);

const receipt = await tx.wait();
```

### 4. Submit Survey Response
```typescript
// Get survey instance
const surveyContract = new ethers.Contract(surveyAddress, ABIS.survey, signer);

// Submit encrypted responses
const tx = await surveyContract.submitResponses([
  "encryptedResponse1",
  "encryptedResponse2",
  // ... more responses
]);
```

## 📁 File Structure

```
contracts/
├── index.ts              # Main exports with contract addresses
├── examples.ts           # Usage examples
├── README.md            # This file
└── abis/                # Contract ABIs (auto-updated)
    ├── ConfidentialSurvey.json
    └── ConfidentialSurvey_Factory.json
```

## 🔄 ABI Updates

The ABI files are automatically synchronized with deployed contracts:

```bash
# ABIs are updated automatically when contracts are deployed
# Current ABIs match the verified Sepolia contracts
```

## 🌐 Network Configuration

### Sepolia Testnet (Current)
- **Chain ID**: 11155111
- **RPC**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Explorer**: https://eth-sepolia.blockscout.com
- **Factory Address**: `0xeD772f032bB500F55ed715781CcABff4625Cc5C8`

### Network Verification
```typescript
import { verifyNetwork } from '@/services/contracts/examples';

// Verify user is on correct network
try {
  verifyNetwork(chainId);
  console.log('✅ Correct network');
} catch (error) {
  console.error('❌ Wrong network:', error.message);
}
```

## 💡 Usage Examples

### React Hook Example
```typescript
import { useFactoryContract } from '@/services/contracts/examples';

function MyComponent() {
  const { contract, address, networkConfig } = useFactoryContract(provider) || {};
  
  if (!contract) return <div>Connect wallet first</div>;
  
  return (
    <div>
      <p>Factory: {address}</p>
      <p>Network: {networkConfig?.name}</p>
    </div>
  );
}
```

### Factory Statistics
```typescript
import { getFactoryStats } from '@/services/contracts/examples';

const stats = await getFactoryStats(provider);
console.log(`Total Surveys: ${stats.totalSurveys}`);
console.log(`Factory Owner: ${stats.owner}`);
```

## 🔍 Verification Links

All contracts are verified on Sepolia Blockscout:

- [Factory Proxy](https://eth-sepolia.blockscout.com/address/0xeD772f032bB500F55ed715781CcABff4625Cc5C8#code) ← **Use this**
- [Factory Implementation](https://eth-sepolia.blockscout.com/address/0x95a37bc1148a2Dba364865926863f06B828e5FE4#code) ✅ **Verified**
- [Survey Example](https://eth-sepolia.blockscout.com/address/0x71fcad2522510202CA8D1eB9f1C689CE0AB22894#code) ✅ **Verified**
- [Proxy Admin](https://eth-sepolia.blockscout.com/address/0x8b7bcBCee9de4134e553365499f206698A9fB434#code)

## 🆕 What's New (September 1, 2025)

- ✅ **Updated contract addresses** to verified Sepolia deployment
- ✅ **Synchronized ABIs** with deployed contracts  
- ✅ **Added network configuration**
- ✅ **Enhanced TypeScript support**
- ✅ **Added usage examples**
- ✅ **Ready for production integration**

## 🚀 Production Deployment

When ready for mainnet:

1. Deploy contracts to mainnet using deployment scripts
2. Update `index.ts` with mainnet addresses
3. Verify mainnet contracts on Etherscan
4. Test thoroughly before going live

## 📞 Support

- **Contracts Repo**: [fhedback/contracts](../../contracts/)
- **Deployment Docs**: [DEPLOYMENTS.md](../../contracts/docs/DEPLOYMENTS.md)
- **Block Explorer**: [Sepolia Blockscout](https://eth-sepolia.blockscout.com)

---

**Ready to integrate!** 🎉 All contracts are deployed, verified, and ready for frontend integration.
