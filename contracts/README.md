# 🔐 FHEdback Smart Contracts

> Confidential Survey Platform powered by Zama's Fully Homomorphic Encryption (FHE). This directory contains all smart contracts, deployment scripts, tests, and development tools.

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-orange)](https://docs.soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.0-yellow)](https://hardhat.org/)
[![FHEVM](https://img.shields.io/badge/FHEVM-0.7.0-purple)](https://docs.zama.ai/fhevm)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Contract Architecture](#-contract-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Gas Optimization](#-gas-optimization)

---

## 🌟 Overview

FHEdback smart contracts implement a privacy-preserving survey system using Fully Homomorphic Encryption. The system consists of:

- **Factory Pattern**: Create unlimited survey instances
- **FHE Integration**: All responses encrypted with homomorphic encryption
- **On-Chain Storage**: Decentralized data storage on blockchain
- **Statistical Operations**: Aggregate analysis on encrypted data

### Key Features

- ✅ **Privacy-First**: Individual responses remain encrypted forever
- ✅ **Zero-Knowledge Proofs**: Response validation without revealing values
- ✅ **Gas Optimized**: Efficient design (max 15 questions, 1000 respondents)
- ✅ **Upgradeable**: Not upgradeable by design for security
- ✅ **Event-Driven**: Comprehensive event logging for transparency

---

## 🏗️ Contract Architecture

### Core Contracts

#### 1. ConfidentialSurvey_Factory

Factory contract for creating and managing survey instances.

```solidity
contract ConfidentialSurvey_Factory is Ownable, ReentrancyGuard {
    uint256 public totalSurveys;
    mapping(uint256 => address) public surveys;
    mapping(address => uint256[]) public ownerSurveys;
    
    function createSurvey(...) external returns (uint256, address);
    function getSurveysByOwner(address) external view returns (uint256[]);
}
```

**Key Functions:**
- `createSurvey()` - Deploy new confidential survey contract
- `getSurveysByOwner()` - Query surveys by owner address
- `totalSurveys()` - Get total number of surveys created
- `isValidSurvey()` - Validate survey contract address

**Deployed Address (Sepolia):**
```
0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
```

#### 2. ConfidentialSurvey

Individual survey contract with FHE capabilities.

```solidity
contract ConfidentialSurvey is ConfidentialSurvey_Base, ReentrancyGuard {
    SurveyDetails public surveyDetails;
    mapping(uint256 => QuestionStats) public questionStats;
    mapping(address => RespondentStats) public respondentStats;
    
    function publishSurvey(uint8[] calldata) external onlyOwner;
    function submitResponses(externalEuint8[] calldata, bytes calldata) external;
    function closeSurvey() external onlyOwner;
}
```

**Key Functions:**
- `publishSurvey()` - Activate survey for responses
- `submitResponses()` - Submit encrypted responses with ZK proofs
- `closeSurvey()` - End response collection
- `getQuestionStatistics()` - Get encrypted aggregate statistics
- `getRespondentStatistics()` - Get encrypted respondent data

#### 3. ConfidentialSurvey_Base

Base contract with core functionality and access control.

**Features:**
- Survey lifecycle management (Created → Active → Closed → Trashed)
- Access control (onlyOwner, notOwner, notResponded)
- FHE statistics management
- Event emissions

### Data Structures

```solidity
struct SurveyDetails {
    address owner;              // Survey creator
    string symbol;              // Survey symbol (max 10 chars)
    string metadataCID;         // IPFS metadata CID
    string questionsCID;        // IPFS questions CID
    uint256 totalQuestions;     // Number of questions (1-15)
    uint256 respondentLimit;    // Max respondents (1-1000)
    uint256 createdAt;          // Creation timestamp
    SurveyStatus status;        // Current status
}

enum SurveyStatus {
    Created,    // Initial state, editable
    Active,     // Accepting responses
    Closed,     // Completed, no more responses
    Trashed     // Deleted
}

struct QuestionStats {
    euint64 total;          // Sum of responses
    euint64 sumSquares;     // Sum of squares
    euint8 minScore;        // Minimum score
    euint8 maxScore;        // Maximum score
    mapping(uint8 => euint64) frequency;  // Score frequency
}

struct RespondentStats {
    euint64 total;          // Sum of user's responses
    euint64 sumSquares;     // Sum of squares
    euint8 minScore;        // User's min score
    euint8 maxScore;        // User's max score
}
```

### Contract Limits

| Parameter | Limit | Reason |
|-----------|-------|--------|
| Questions | 1-15 | Gas optimization |
| Respondents | 1-1000 | Practical & gas limits |
| Score Range | 1-10 | FHE efficiency |
| Symbol Length | 1-10 chars | Gas optimization |

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.0.0
- **npm** >= 7.0.0
- **Git** for version control
- **Sepolia ETH** for testnet deployment (from faucet)

### Recommended Tools

- [Hardhat](https://hardhat.org/) - Development environment
- [MetaMask](https://metamask.io/) - Wallet for testing
- [Etherscan](https://sepolia.etherscan.io/) - Contract verification

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/erzawansyah/fhedback.git
cd fhedback/contracts
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Hardhat & plugins
- FHEVM libraries
- OpenZeppelin contracts
- Testing libraries
- TypeScript & TypeChain

### 3. Verify Installation

```bash
npm run compile
```

Should output:
```
Compiled X Solidity files successfully
```

---

## ⚙️ Configuration

### Environment Setup

#### Option 1: Interactive Setup (Recommended)

```bash
npm run setup:env
```

This will guide you through setting up:
- `MNEMONIC` - 12-word seed phrase
- `INFURA_API_KEY` - RPC endpoint
- `ETHERSCAN_API_KEY` - Contract verification

#### Option 2: Manual Setup

```bash
# Set mnemonic (seed phrase)
npx hardhat vars set MNEMONIC "your twelve word seed phrase here"

# Set Infura API key
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"

# Set Etherscan API key (for verification)
npx hardhat vars set ETHERSCAN_API_KEY "your_etherscan_api_key"
```

#### Option 3: Environment File

Create `.env` file (not recommended for production):

```env
MNEMONIC="your twelve word seed phrase"
INFURA_API_KEY="your_infura_key"
ETHERSCAN_API_KEY="your_etherscan_key"
BLOCKSCOUT_API_KEY="your_blockscout_key"
```

### Verify Configuration

```bash
npm run check:env
```

---

## 💻 Development

### Compile Contracts

Compile all Solidity contracts and generate TypeScript types:

```bash
# Regular compile
npm run compile

# Force recompile (clean first)
npm run compile:force

# Generate only TypeScript types
npm run typechain
```

**Output:**
- `artifacts/` - Compiled contracts
- `types/` - TypeScript type definitions
- `cache/` - Hardhat cache

### Code Quality

#### Linting

```bash
# Run all linters
npm run lint

# Lint Solidity files only
npm run lint:sol

# Lint TypeScript files only
npm run lint:ts
```

#### Code Formatting

```bash
# Check formatting
npm run prettier:check

# Auto-fix formatting
npm run prettier:write
```

### Local Development

#### Start Local Node

```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

#### Deploy Locally

```bash
# Terminal 2: Deploy contracts
npm run deploy:local
```

---

## 🧪 Testing

### Test Results Summary

Latest test run: **72 passing** out of 74 tests (2 tests with known limitations)

```
✅ 72 passing (3 minutes)
⚠️  2 failing (known FHE transaction limits)
```

**Test Coverage by Category:**

| Category | Tests | Status |
|----------|-------|--------|
| Survey Creation & Setup | 15 | ✅ All Pass |
| Response Collection | 7 | ✅ All Pass |
| Statistics & Analysis | 9 | ✅ All Pass |
| Factory Operations | 16 | ✅ All Pass |
| Getter Functions | 18 | ✅ All Pass |
| Edge Cases | 7 | ⚠️ 2 Known Limits |

**Known Limitations:**
- Large-scale survey test fails due to FHE transaction limits (expected behavior)
- Gas cost slightly higher than target (optimization ongoing)

> 📄 See detailed test report: **[TEST_RESULTS.md](TEST_RESULTS.md)**

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
# Test factory contract
npx hardhat test test/ConfidentialSurvey_Factory.test.ts

# Test survey contract
npx hardhat test test/ConfidentialSurvey.test.ts

# Test getters
npx hardhat test test/ConfidentialSurvey_Getters.test.ts
```

### Test Coverage

```bash
npm run coverage
```

**Output:**
- Coverage report in terminal
- HTML report in `coverage/`

### Gas Reporting

```bash
REPORT_GAS=true npm test
```

### Test Structure

```
test/
├── ConfidentialSurvey_Factory.test.ts  # Factory contract tests
├── ConfidentialSurvey.test.ts          # Main survey tests
└── ConfidentialSurvey_Getters.test.ts  # Getter function tests
```

**Test Coverage Areas:**
- ✅ Factory creation & management
- ✅ Survey lifecycle (Created → Active → Closed)
- ✅ Response submission & validation
- ✅ FHE operations & encryption
- ✅ Access control & permissions
- ✅ Edge cases & error handling
- ✅ Gas optimization
- ✅ Event emissions

---

## 🚀 Deployment

### Deploy to Sepolia Testnet

#### 1. Prepare Account

Ensure your wallet has Sepolia ETH:
- Get from [Sepolia Faucet](https://sepoliafaucet.com/)
- Or [Alchemy Faucet](https://sepoliafaucet.com/)

#### 2. Configure Environment

```bash
npm run setup:env
```

#### 3. Deploy Contracts

```bash
# Deploy to Sepolia
npm run deploy:sepolia
```

**Deployment Process:**
1. Compile contracts
2. Deploy Factory contract
3. Verify on Etherscan
4. Generate contract info
5. Save deployment addresses

#### 4. Verify Deployment

```bash
# Check deployed contracts
npx hardhat run scripts/test-deployed-factory.ts --network sepolia
```

### Full Deployment Workflow

Deploy and copy contract info to frontend:

```bash
npm run deploy:full
```

This will:
1. Deploy contracts to Sepolia
2. Generate contract info JSON
3. Copy ABIs and addresses to frontend
4. Update frontend constants

### Manual Contract Verification

If automatic verification fails:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 📜 Scripts

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile contracts |
| `npm run test` | Run all tests |
| `npm run deploy:sepolia` | Deploy to Sepolia |
| `npm run lint` | Run all linters |
| `npm run prettier:write` | Format code |
| `npm run coverage` | Generate test coverage |
| `npm run clean` | Clean artifacts |

### Custom Scripts

#### Generate Contract Info

```bash
npm run generate:contract-info:sepolia
```

Generates JSON with:
- Contract addresses
- ABIs
- Network info
- Deployment timestamps

#### Copy to Frontend

```bash
npm run copy:to-frontend
```

Copies contract artifacts to frontend directory for integration.

#### Check Environment

```bash
npm run check:env
```

Validates environment configuration.

---

## 📁 Project Structure

```
contracts/
├── 📁 contracts/                    # Solidity source files
│   ├── ConfidentialSurvey_Factory.sol
│   ├── ConfidentialSurvey.sol
│   └── 📁 modules/
│       ├── ConfidentialSurvey_Base.sol
│       └── ConfidentialSurvey_Storage.sol
│
├── 📁 deploy/                       # Hardhat Deploy scripts
│   └── deploy.ts                   # Main deployment script
│
├── 📁 test/                        # Test suites
│   ├── ConfidentialSurvey_Factory.test.ts
│   ├── ConfidentialSurvey.test.ts
│   └── ConfidentialSurvey_Getters.test.ts
│
├── 📁 scripts/                     # Utility scripts
│   ├── check-env.ts               # Environment validation
│   ├── generate-types.ts          # TypeChain generation
│   ├── generate-contract-info.ts  # Contract info JSON
│   ├── copy-to-frontend.ts        # Copy to frontend
│   ├── setup-env.sh               # Environment setup
│   └── test-deployed-factory.ts   # Test deployment
│
├── 📁 tasks/                       # Custom Hardhat tasks
│   └── accounts.ts                # Account management
│
├── 📁 types/                       # Generated TypeScript types
│   ├── common.ts
│   ├── factories/
│   └── contracts/
│
├── 📁 artifacts/                   # Compiled contracts
├── 📁 cache/                       # Hardhat cache
├── 📁 deployments/                 # Deployment history
│   └── sepolia/                   # Sepolia deployments
│
├── hardhat.config.ts              # Hardhat configuration
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies & scripts
└── README.md                      # This file
```

---

## 🔒 Security

### Security Features

1. **Access Control**
   - Only survey owner can manage survey
   - Only non-owners can submit responses
   - Single response per address

2. **ReentrancyGuard**
   - Protection on all state-changing functions
   - Prevents reentrancy attacks

3. **FHE Security**
   - All responses encrypted with homomorphic encryption
   - Statistics computed without decryption
   - Zero-knowledge proofs for validation

4. **Input Validation**
   - Symbol length validation (1-10 chars)
   - Question count limits (1-15)
   - Respondent limits (1-1000)
   - Score range validation (1-10)

5. **Gas Limits**
   - Bounded operations to prevent DoS
   - Optimized storage patterns

### Known Limitations

- **Max 15 questions** - Gas optimization constraint
- **Max 1000 respondents** - Practical limit for on-chain storage
- **Score range 1-10** - FHE efficiency constraint
- **Non-upgradeable** - Deployed contracts cannot be upgraded
- **Sepolia only** - Currently deployed on testnet only

### Security Audit Status

- ⚠️ **Not audited** - This is a testnet project
- Use at your own risk
- Not recommended for mainnet deployment without audit

---

## ⚡ Gas Optimization

### Gas Costs (Approximate)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Deploy Factory | ~4.1M | One-time cost |
| Create Survey | ~3.2M | Per survey |
| Publish Survey | ~200K | Per survey |
| Submit Response | ~500K-1M | Varies with questions |
| Close Survey | ~100K | Per survey |

### Optimization Strategies

1. **Bounded Loops**
   - Limited question count (15 max)
   - Limited respondent count (1000 max)

2. **Efficient Storage**
   - Packed structs where possible
   - Minimal storage slots
   - Events instead of storage for history

3. **FHE Operations**
   - Optimized homomorphic operations
   - Minimal on-chain computations

4. **Batch Operations**
   - Submit all responses in one transaction
   - Update statistics homomorphically

---

## 📚 Additional Resources

### Documentation

- **Hardhat**: https://hardhat.org/docs
- **FHEVM**: https://docs.zama.ai/fhevm
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts
- **Solidity**: https://docs.soliditylang.org/

### Tools

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://eth-sepolia.blockscout.com/
- **Hardhat Network**: https://hardhat.org/hardhat-network/

### Support

- **Issues**: [GitHub Issues](https://github.com/erzawansyah/fhedback/issues)
- **Discussions**: [GitHub Discussions](https://github.com/erzawansyah/fhedback/discussions)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Run tests: `npm test`
4. Run linters: `npm run lint`
5. Commit changes: `git commit -m "feat: description"`
6. Push branch: `git push origin feature/name`
7. Open Pull Request

---

## 📄 License

This project is licensed under **BSD-3-Clause-Clear License**.

---

## 🙏 Acknowledgments

- **[Zama](https://zama.ai/)** - FHE Technology & FHEVM
- **[OpenZeppelin](https://openzeppelin.com/)** - Smart Contract Libraries
- **[Hardhat](https://hardhat.org/)** - Development Framework

---

## 📞 Contact & Social

**Project Links:**
- **Repository**: [github.com/erzawansyah/fhedback](https://github.com/erzawansyah/fhedback)
- **Live Demo**: [fhedback.vercel.app](https://fhedback.vercel.app)
- **Website**: [mew3.xyz](https://mew3.xyz)

**Connect with the Developer:**
- **GitHub**: [@erzawansyah](https://github.com/erzawansyah)
- **Twitter/X**: [@mew294071](https://twitter.com/mew294071)
- **Discord**: erzawansyah
- **Farcaster**: [mewww.eth](https://farcaster.xyz/mewww.eth)

---

**Built with ❤️ using Zama's Fully Homomorphic Encryption**


