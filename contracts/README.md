# 🔐 FHEdback Smart Contracts

This repository contains the smart contracts for FHEdback, a Confidential Survey Platform powered by Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine).

## 🌟 Overview

FHEdback leverages Zama's Fully Homomorphic Encryption (FHE) technology to create a privacy-preserving survey platform that enables:

- **Complete Confidentiality**: All survey responses are encrypted and remain private
- **Statistical Analysis**: Perform computations on encrypted data without exposing individual responses
- **Zero-Knowledge Proofs**: Validate response integrity without revealing actual values
- **On-Chain Management**: Decentralized survey creation and lifecycle management

### 🏗️ Core Features:
- **Confidentiality**: All survey responses are encrypted, ensuring user privacy
- **Homomorphic Operations**: Perform statistical computations without decrypting data
- **Access Control**: Robust permission system for survey management
- **Direct Architecture**: Simplified deployment without proxy complexity
- **Gas Optimized**: Efficient design supporting up to 15 questions and 1000 respondents

## 📋 Smart Contract Architecture

### Core Contracts

#### 🏭 **ConfidentialSurvey_Factory** 
The main factory contract that creates and manages individual survey instances using direct deployment pattern.

**Key Functions:**
- `createSurvey()` - Deploy new confidential survey contracts directly
- `getSurveysByOwner()` - Retrieve all surveys created by a specific owner
- `totalSurveys()` - Get the total number of surveys created
- `surveys()` - Access survey by ID

#### 📊 **ConfidentialSurvey**
Individual survey contract instance with full FHE capabilities.

**Key Functions:**
- `publishSurvey()` - Activate survey for response collection
- `submitResponses()` - Submit encrypted responses with ZK proofs
- `closeSurvey()` - End response collection period
- `getQuestionStatistics()` - Access encrypted statistical data
- `getRespondentStatistics()` - Access encrypted respondent data

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend dApp                        │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────▼──────────────────────────────────┐
         │     ConfidentialSurvey_Factory             │
         │  ┌─────────────────────────────────────┐   │
         │  │ • createSurvey()                    │   │
         │  │ • getSurveysByOwner()              │   │  
         │  │ • totalSurveys()                   │   │
         │  │ • queryLatestSurveys()             │   │
         │  └─────────────────────────────────────┘   │
         └────────┬──────────────────────────────────┘
                  │ deploys
         ┌────────▼──────────────────────────────────┐
         │       ConfidentialSurvey                   │
         │  ┌─────────────────────────────────────┐   │
         │  │ Survey Management:                  │   │
         │  │ • publishSurvey()                   │   │
         │  │ • closeSurvey()                    │   │
         │  │ • deleteSurvey()                   │   │
         │  │                                    │   │
         │  │ Response Handling:                 │   │
         │  │ • submitResponses() [FHE]          │   │
         │  │                                    │   │
         │  │ Statistics Access:                 │   │
         │  │ • getQuestionStatistics() [FHE]    │   │
         │  │ • getRespondentStatistics() [FHE]  │   │
         │  └─────────────────────────────────────┘   │
         └───────────────────────────────────────────┘
```

### � Survey Workflow

```
1. CREATE    → Factory.createSurvey() → Survey Contract Deployed
   ↓
2. SETUP     → Survey.updateMetadata() / updateQuestions()
   ↓  
3. PUBLISH   → Survey.publishSurvey(maxScores[]) → Status: Active
   ↓
4. COLLECT   → Users.submitResponses(encrypted, proofs)
   ↓
5. ANALYZE   → Survey.closeSurvey() → Status: Closed
   ↓
6. DECRYPT   → Owner.grantOwnerDecrypt() → Access Statistics
```

## 🌐 Deployment Information

### 📋 Sepolia Testnet (VERIFIED ✅)
**Deployment Date**: October 30, 2025  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Status**: Factory contract deployed and verified

| Contract | Address | Purpose | Explorer |
|----------|---------|---------|----------|
| **ConfidentialSurvey_Factory** 🎯 | [`0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04`](https://eth-sepolia.blockscout.com/address/0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04#code) | **Main Factory Contract** | [View Code](https://eth-sepolia.blockscout.com/address/0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04#code) |

> 🎯 **For Frontend Integration**: Use the **Factory** address `0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04` to create and manage surveys.

> 📋 Contract is **verified** on Sepolia Blockscout. Click the link above to view source code and interact with the contract.

### 🚀 Quick Start (Frontend Integration)

To use the deployed factory in your dApp:

```typescript
import { ethers } from "ethers";

// Connect to the deployed factory
const factoryAddress = "0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04";
const factory = await ethers.getContractAt(
  "ConfidentialSurvey_Factory", 
  factoryAddress
);

// Create a new survey
const tx = await factory.createSurvey(
  ownerAddress,           // survey owner
  "MYSURVEY",            // survey symbol (max 10 chars)
  "QmMetadataCID...",     // IPFS metadata CID
  "QmQuestionsCID...",    // IPFS questions CID  
  5,                     // total questions
  100                    // max respondents
);

const receipt = await tx.wait();
const [surveyId, surveyAddress] = receipt.logs[0].args;
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm 7+
- Git for version control
- Basic understanding of Solidity and Hardhat

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd contracts

# Install dependencies
npm install

# Configure environment variables (interactive)
npm run setup:env

# Compile contracts and generate TypeScript types
npm run compile

# Run test suite
npm run test
```

### Environment Setup

The setup script will guide you through configuring:
- **MNEMONIC**: 12-word seed phrase for deployment wallet
- **INFURA_API_KEY**: RPC endpoint for Sepolia network  
- **ETHERSCAN_API_KEY**: For contract verification

```bash
npm run setup:env
```

Or set manually:
```bash
npx hardhat vars set MNEMONIC "your twelve word seed phrase here"
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"
npx hardhat vars set ETHERSCAN_API_KEY "your_etherscan_api_key"
```

## 🏭 ConfidentialSurvey_Factory Functions

### Survey Creation
- **`createSurvey()`** - Creates a new survey instance with specified parameters
  - Returns: `(uint256 surveyId, address surveyAddress)`
  - Parameters: owner, symbol, metadata CID, questions CID, total questions, respondent limit
  - Emits: `SurveyCreated` event

### Survey Management
- **`getSurveysByOwner(address)`** - Returns array of survey IDs owned by specific address
- **`getSurveyAddress(uint256)`** - Returns survey contract address by ID  
- **`getSurveyId(address)`** - Returns survey ID by contract address
- **`getAllSurveys()`** - Returns all survey contract addresses
- **`totalSurveys()`** - Returns total number of surveys created
- **`getSurveyCountByOwner(address)`** - Returns count of surveys per owner
- **`isValidSurvey(address)`** - Validates if address is a legitimate survey contract

### Query Functions  
- **`queryLatestSurveys(offset, limit)`** - Paginated query of recent surveys (max 50 per call)

## 📊 ConfidentialSurvey Functions

### Survey Lifecycle Management
- **`publishSurvey(uint8[])`** - Activates survey for response collection with max scores per question
- **`closeSurvey()`** - Ends response collection period (requires minimum respondents)
- **`deleteSurvey()`** - Permanently removes survey (only when not active)

### Metadata Management
- **`updateSurveyMetadata(string)`** - Updates IPFS metadata CID (before publishing)
- **`updateQuestions(string, uint256)`** - Updates questions CID and count (before publishing)

### Response Collection
- **`submitResponses(externalEuint8[], bytes)`** - Submits encrypted responses with ZK proofs
  - Validates response count matches questions
  - Prevents duplicate submissions
  - Auto-closes at respondent limit

### Owner Capabilities
- **`grantOwnerDecrypt(uint256)`** - Grants owner access to decrypt question statistics (after closure)

### Data Access (View Functions)
- **`getSurvey()`** - Returns complete survey details struct
- **`getSurveyStatus()`** - Returns current survey state (Created/Active/Closed/Trashed)
- **`getTotalQuestions()`** - Returns number of questions in survey
- **`getTotalRespondents()`** - Returns current respondent count
- **`getRespondentLimit()`** - Returns maximum allowed respondents
- **`getHasResponded(address)`** - Checks if address has submitted responses

### Statistical Data Access
- **`getQuestionStatistics(uint256)`** - Returns encrypted stats for specific question
- **`getFrequencyCount(uint256, uint8)`** - Returns encrypted frequency for question/answer pair
- **`getQuestionFrequencies(uint256)`** - Returns all frequency counts for a question
- **`getMaxScore(uint256)`** - Returns maximum allowed score for question
- **`getAllMaxScores()`** - Returns max scores for all questions

### Respondent Data Access  
- **`getRespondentResponse(address, uint256)`** - Returns encrypted response for specific question
- **`getRespondentResponses(address)`** - Returns all encrypted responses from respondent
- **`getRespondentStatistics(address)`** - Returns encrypted personal statistics
- **`getRespondentAt(uint256)`** - Returns respondent address by index
- **`getAllRespondents()`** - Returns all respondent addresses

### Survey Information
- **`isActive()`** - Checks if survey is accepting responses
- **`isClosed()`** - Checks if survey is closed
- **`isTrashed()`** - Checks if survey is deleted
- **`hasReachedLimit()`** - Checks if respondent limit reached
- **`getProgress()`** - Returns completion percentage (0-100)
- **`getRemainingSlots()`** - Returns available respondent slots

## � Data Structures

### SurveyDetails Struct
```solidity
struct SurveyDetails {
    address owner;           // Survey creator address
    string symbol;           // Survey symbol (max 10 chars)
    string metadataCID;      // IPFS metadata CID
    string questionsCID;     // IPFS questions CID
    uint256 totalQuestions;  // Number of questions
    uint256 respondentLimit; // Max respondents (1-1000)
    uint256 createdAt;       // Creation timestamp
    SurveyStatus status;     // Current survey state
}
```

### Survey Status Enum
```solidity
enum SurveyStatus {
    Created,    // Initial editable state
    Active,     // Accepting encrypted responses
    Closed,     // Completed, statistics accessible
    Trashed     // Permanently deleted
}
```

### Encrypted Statistics Structs
```solidity
struct QuestionStats {
    euint64 total;       // Σ x (sum of responses)
    euint64 sumSquares;  // Σ x² (for variance calculation)
    euint8 minScore;     // Minimum response value
    euint8 maxScore;     // Maximum response value
}

struct RespondentStats {
    euint64 total;       // Sum of all user responses
    euint64 sumSquares;  // Sum of squares for user
    euint8 minScore;     // User's minimum score
    euint8 maxScore;     // User's maximum score  
}
```

## 🔒 Security Features

### Access Control
- **onlyOwner**: Survey management restricted to creator
- **notOwner**: Prevents survey owners from responding to their own surveys
- **notResponded**: Ensures single response per address
- **ReentrancyGuard**: Prevents reentrancy attacks on response submission

### Gas Optimizations
- **MAX_QUESTIONS**: Limited to 15 questions per survey
- **MAX_RESPONDENTS**: Capped at 1000 respondents
- **MAX_SCORE_PER_QUESTION**: Bounded to 10 for efficient operations

### FHE Security
- **Encrypted Storage**: All responses stored as encrypted data
- **Access Control Lists**: Fine-grained decrypt permissions
- **Zero-Knowledge Proofs**: Response validation without revealing values

## 📁 Project Structure

```text
contracts/
├── 📁 contracts/                    # Solidity source files
│   ├── ConfidentialSurvey.sol      # Main survey contract  
│   ├── ConfidentialSurvey_Factory.sol # Survey factory
│   └── 📁 modules/                 # Contract modules
│       ├── ConfidentialSurvey_Base.sol      # Base functionality
│       └── ConfidentialSurvey_Storage.sol   # Storage layout
├── 📁 deploy/                      # Hardhat deployment scripts
│   └── 01_deploy_all.ts           # Factory deployment script
├── 📁 test/                        # Comprehensive test suites  
├── 📁 types/                       # Auto-generated TypeChain types
├── 📁 tasks/                       # Custom Hardhat tasks
├── 📁 scripts/                     # Utility scripts
│   ├── check-env.ts               # Environment validation
│   └── test-deployed-factory.ts   # Factory testing
└── 📄 hardhat.config.ts           # Hardhat configuration
```

## 🔐 Encryption & Privacy

### Fully Homomorphic Encryption (FHE)
- All survey responses are encrypted using Zama's FHEVM
- Statistical computations performed on encrypted data
- Individual responses never revealed, only aggregated results
- Zero-knowledge proofs validate response integrity

### Access Control System
- **Survey Owner**: Can decrypt aggregated statistics after survey closure
- **Respondents**: Can decrypt only their own encrypted responses  
- **Public**: Can view survey metadata and participation status
- **Contract**: Has permanent ACL on all encrypted operations

### Privacy Guarantees
- **Response Confidentiality**: Individual answers remain encrypted
- **Statistical Privacy**: Only aggregated data accessible to owners
- **Participation Privacy**: Response submission doesn't reveal values
- **Temporal Privacy**: Decryption only possible after survey closure

## � Contract Summary

### ConfidentialSurvey_Factory
- **Purpose**: Creates and manages survey instances
- **Type**: Direct deployment (non-upgradeable)
- **Functions**: 8 main functions + query utilities
- **Gas Cost**: ~4.1M for deployment, ~3.1M per survey creation

### ConfidentialSurvey  
- **Purpose**: Individual survey with FHE capabilities
- **Type**: Direct deployment via factory
- **Functions**: 35+ functions covering full survey lifecycle
- **Gas Cost**: ~3.2M for deployment
- **Limits**: Max 15 questions, 1000 respondents, score range 1-10

### Key Constraints
- **Survey Symbol**: 1-10 characters
- **Questions**: 1-15 per survey  
- **Respondents**: 1-1000 per survey
- **Response Values**: 1-10 (configurable per question)
- **Response Requirement**: All questions must be answered

### Deployment Status
- **Network**: Sepolia Testnet
- **Factory**: `0x359B60b008524Da24a154e17B8Bb528Fb7e1aF04`
- **Status**: ✅ Verified & Production Ready

---

*Privacy-preserving surveys powered by Zama's Fully Homomorphic Encryption* 🔐
