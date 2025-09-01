# ⚡ FHEdback Quick Reference

Quick access to essential information for FHEdback development and usage.

## 🔗 Key Addresses (Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **Factory Proxy** 🎯 | `0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214` | **Main interface for creating surveys** |
| Survey Implementation | `0xb213a72EfF95D042112a13Ea749094a7624F7e6A` | Survey logic template |
| Factory Implementation | `0xe6EB51400def6B97C5cadb1984f701F3996152f0` | Factory logic |
| ProxyAdmin | `0x8b7bcBCee9de4134e553365499f206698A9fB434` | Upgrade management |

> 🎯 **Use `0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214` for all frontend integrations**

## ⚙️ Environment Variables

### Frontend (.env.local)
```bash
# Required
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Optional
VITE_ZAMA_TESTNET_RPC=https://devnet.zama.ai
VITE_APP_NAME=FHEdback
```

### Smart Contracts (Hardhat vars)
```bash
npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase"
npx hardhat vars set INFURA_API_KEY "your_infura_key"  
npx hardhat vars set ETHERSCAN_API_KEY "your_etherscan_key"
```

## 🚀 Essential Commands

### Frontend Development
```bash
cd frontend
npm install                 # Install dependencies
cp .env.example .env.local  # Setup environment
npm run dev                 # Start dev server
npm run build              # Production build
npm run type-check         # TypeScript validation
npm run lint               # Run ESLint
```

### Smart Contract Development
```bash
cd contracts
npm install                # Install dependencies
npm run setup:env          # Configure environment (interactive)
npm run compile           # Compile contracts + generate types
npm run test              # Run test suite
npm run deploy:sepolia    # Deploy to Sepolia (first time only)
npm run upgrade:survey-impl:sepolia  # Upgrade survey logic
```

## 🏗️ Core API Usage

### Create Survey (Frontend)
```typescript
import { useSurveyCreation } from '@/hooks/useSurveyCreation'

const { createSurvey, isPending, isConfirmed } = useSurveyCreation()

// Create survey
createSurvey({
  owner: address,
  symbol: "SURV", 
  metadataCID: "Qm...",
  questionsCID: "Qm...",
  totalQuestions: 5,
  respondentLimit: 100
})
```

### Read Contract Data
```typescript
import { useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'

// Get user's surveys
const { data: surveys } = useReadContract({
  address: FACTORY_ADDRESS,
  abi: ABIS.factory,
  functionName: 'getSurveysByOwner',
  args: [userAddress]
})

// Get survey details
const { data: surveyData } = useReadContract({
  address: surveyAddress,
  abi: ABIS.survey,
  functionName: 'survey'
})
```

## 📊 Survey States & Lifecycle

```
Created (0) → Published → Active (1) → Closed (2)
     ↓                                      ↑
  Trashed (3) ←─────── Delete ──────────────┘
```

| State | Code | Description | Available Actions |
|-------|------|-------------|------------------|
| Created | 0 | Draft mode, editable | Edit metadata, Publish, Delete |
| Active | 1 | Live, accepting responses | Submit responses, Close |
| Closed | 2 | Completed, results available | View results |  
| Trashed | 3 | Permanently deleted | None |

## 🔐 Key Functions Reference

### Factory Contract
```solidity
function createSurvey(
    address owner,
    string memory symbol,
    string memory metadataCID,
    string memory questionsCID,
    uint256 totalQuestions,
    uint256 respondentLimit
) external returns (address);

function getSurveysByOwner(address owner) external view returns (address[]);
function totalSurveys() external view returns (uint256);
```

### Survey Contract
```solidity
// Survey management
function publishSurvey(uint8[] calldata maxScores) external;
function closeSurvey() external;
function deleteSurvey() external;

// Response handling
function submitResponses(
    externalEuint8[] calldata encryptedResponses,
    bytes calldata proofs
) external;

// Data access
function getQuestionStatistics(uint256 questionId) external view;
function survey() external view returns (SurveyDetails memory);
function hasResponded(address user) external view returns (bool);
```

## 🧪 Testing Quick Commands

```bash
# Smart contracts
cd contracts
npm run test                           # Run all tests
npm run test -- --grep "Survey"       # Run specific tests
npm run coverage                       # Coverage report

# Frontend  
cd frontend
npm run test                          # Unit tests (when available)
```

## 🔧 Debugging & Development

### Common Issues & Solutions

**1. Transaction Fails**
```bash
# Check gas estimation and network status
# Verify contract addresses are correct
# Ensure wallet has sufficient ETH
```

**2. Environment Setup**
```bash
# Frontend: Check .env.local exists and has all required vars
# Contracts: Run `npm run check:env` to validate setup
```

**3. Contract Interaction Issues**
```bash
# Verify you're on Sepolia network (Chain ID: 11155111)
# Check contract addresses match deployment
# Ensure ABI is up to date after contract changes
```

### Useful Development URLs

- **Sepolia Blockscout**: https://eth-sepolia.blockscout.com/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Factory Contract**: https://eth-sepolia.blockscout.com/address/0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214

## 📁 File Structure Quick Reference

```
fhedback/
├── frontend/
│   ├── src/components/     # Reusable UI components
│   ├── src/routes/        # Page components (TanStack Router)
│   ├── src/hooks/         # Custom React hooks
│   ├── src/services/      # Web3 and API integrations
│   └── src/types/         # TypeScript definitions
└── contracts/
    ├── contracts/         # Solidity source files
    ├── deploy/           # Deployment scripts
    ├── test/             # Test suites
    └── types/            # Generated TypeScript types
```

## 🎯 Key Design Patterns

**Custom Hooks**: Encapsulate complex logic
```typescript
const { createSurvey, isPending } = useSurveyCreation()
```

**Service Layer**: Abstract external services
```typescript
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'
```

**Type Safety**: Leverage TypeScript throughout
```typescript
export type CreateSurveyParams = {
  owner: `0x${string}`
  symbol: string
  // ...
}
```

---

**Need more details?** Check the full documentation in `docs/` folders or the comprehensive README files.
