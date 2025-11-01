# 🔐 FHEdback - Confidential Survey Platform

> A privacy-preserving survey platform built on **Fully Homomorphic Encryption (FHE)** that guarantees absolute privacy. Individual responses remain encrypted forever, while still enabling aggregate statistical analysis by survey creators.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-orange)](https://docs.soliditylang.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://fhedback.vercel.app)

---

## 🌟 Overview

### ❌ Traditional Survey Platform Problems

Traditional survey platforms pose significant privacy risks:

- **Unrestricted Access**: Individual responses can be accessed by survey creators or third parties
- **Data Breach Risks**: Data stored in plain text or simple encryption
- **Imperfect Anonymization**: Individual data can still be linked back to respondents
- **Centralized Trust**: Reliance on administrators to maintain privacy

### ✅ The FHEdback Solution

FHEdback leverages **Fully Homomorphic Encryption (FHE)** from Zama to provide a revolutionary solution:

**How FHE Works:**
- Responses are **encrypted on the client-side** before sending
- Data **remains encrypted** at all times on the blockchain
- Mathematical operations are performed **directly on encrypted data**
- Aggregate results can be **decrypted without accessing individual data**

**Result:**
Survey creators get accurate statistical insights without ever being able to view individual respondent answers.

### 🎯 FHEdback Advantages

- **🔒 Absolute Privacy**: Individual answers can never be accessed in plain text
- **🛡️ High Security**: Data is always end-to-end encrypted, reducing data breach risks
- **📊 Statistical Analysis**: Supports various statistical operations on encrypted data (sum, average, min, max, frequency)
- **🌐 Decentralization**: Data stored on-chain, no single point of failure
- **🔍 Transparency**: Open source smart contracts enable independent audits
- **⚡ Zero-Knowledge Proofs**: Response validation without revealing actual values

### 👥 Who Needs FHEdback?

> *"Anyone who cares about their data privacy can leverage FHEdback to gather insights without compromising privacy."*

- **Research Organizations**: Sensitive surveys with guaranteed respondent privacy
- **Corporations**: Employee feedback without risk of individual identification
- **Educational Institutions**: Safe and private learning evaluations
- **Healthcare**: Health surveys with HIPAA/GDPR compliance
- **Government**: Public polling with guaranteed privacy

---

## 🔄 Survey Lifecycle

### FHEdback Workflow

```
1. CREATE      →  Survey creator defines questions and metadata
                  Survey contract deployed to blockchain
   ↓
2. PUBLISH     →  Survey published and accessible to respondents
                  FHE statistics initialized
   ↓
3. RESPOND     →  Respondents fill out survey
                  Answers encrypted with FHE on client-side
                  Encrypted data sent to blockchain
   ↓
4. STORE       →  Encrypted answers stored on-chain
                  Statistics updated homomorphically
   ↓
5. CLOSE       →  Survey closed after reaching target respondents
                  or manually closed by creator
   ↓
6. ANALYZE     →  Survey creator can access aggregate statistics
                  Decryption only for aggregates, not individuals
```

### When Can Surveys Be Analyzed?

- ✅ Survey reaches **minimum number of respondents** as predetermined
- ✅ Survey creator **manually closes the survey** early
- ❌ Individual answers can **never** be accessed in decrypted form

---

## 🔗 Live Demo & Smart Contracts

### 🌐 Live Application

**Frontend Demo:**
- **Primary**: [https://fhedback.vercel.app](https://fhedback.vercel.app)
- **Alternative**: [https://fhedback.mew3.xyz](https://fhedback.mew3.xyz)

**Network**: Sepolia Testnet (Chain ID: 11155111)

### 📜 Smart Contracts (Sepolia)

**Factory Contract** - Main Entry Point

```
Address:  0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
Status:   ✅ Active
Network:  Sepolia Testnet
Purpose:  Factory to create new survey contracts
Explorer: https://eth-sepolia.blockscout.com/address/0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15
```

**Example Survey Contract**

```
Address:  0x353E12EE4A861737c1604fF6Abe5684879970421
Status:   ✅ Active Survey Instance
Explorer: https://eth-sepolia.blockscout.com/address/0x353E12EE4A861737c1604fF6Abe5684879970421
```

### 🏗️ Contract Architecture

**ConfidentialSurvey_Factory**
- Creates new ConfidentialSurvey instances for each survey
- Each survey has a unique contract address
- Factory records and manages all created surveys
- Facilitates tracking and survey management

**ConfidentialSurvey**
- Individual survey instance with FHE capabilities
- Stores questions, metadata, and encrypted responses
- Manages survey lifecycle (Created → Active → Closed)
- Provides encrypted aggregate statistics

---

## 📚 Technical Documentation

For complete technical documentation, please review the README in each directory:

### 📁 Smart Contracts

**[contracts/README.md](contracts/README.md)**
- Complete smart contract implementation
- Survey creation management
- Encrypted response storage
- Data aggregation process with FHE
- Testing & deployment guide

### 📁 Frontend Application

**[frontend/README.md](frontend/README.md)**
- Web application source code
- Survey creation and publication
- Response submission interface
- Aggregate results visualization
- Setup & development guide

---

## 🚀 Quick Start

### For Users (Non-Technical)

1. **Access application**: Visit [fhedback.vercel.app](https://fhedback.vercel.app)
2. **Connect wallet**: Connect your MetaMask or other wallet
3. **Create survey**: Use the form builder to create a survey
4. **Share link**: Share the survey link with respondents
5. **View results**: Access dashboard to view aggregate statistics

### For Developers

See complete documentation at:
- **Smart Contracts**: [contracts/README.md](contracts/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

---

## 🔮 Potential Development Areas

This section outlines potential enhancements and technical challenges identified during development. These represent areas of interest for future exploration, not committed roadmap items.

### 1. 📝 Multiple Question Types

**Current State**: Only supports rating scale questions (1-5)

**Potential Additions:**
- Multiple choice (single selection)
- Checkbox (multiple selections)
- Yes/No questions
- Text input (open-ended responses with FHE)
- Ranking questions
- Matrix/Grid questions

**Challenge**: Each question type requires different FHE encoding and aggregation methods.

### 2. 💰 Incentive Mechanism

**Concept**: Token-based rewards from survey creators to respondents

**Considerations:**
- Reward escrow during survey period
- Automatic distribution upon submission
- Support for ETH and ERC-20 tokens
- Fair distribution for partial completions

### 3. 🤖 Bot Prevention

**Challenge**: If rewards are implemented, bot abuse becomes critical

**Potential Approaches:**
- On-chain identity verification (WorldID, Proof of Humanity, Gitcoin Passport)
- Minimal staking requirements
- Rate limiting and cooldown periods
- reCAPTCHA integration for high-value surveys
- Balancing privacy with accountability

### 4. 🔍 Advanced Survey Discovery

**Current State**: Basic survey listing

**Potential Features:**
- Filtering (category, status, rewards, completion rate)
- Sorting (date, popularity, deadline)
- Search functionality (title, tags, creator)
- The Graph integration for efficient querying

### 5. 📊 Demographic Analysis

**Concept**: Optional demographic profiling while maintaining privacy

**Approach:**
- Encrypted demographic data (age, location, gender)
- Selective disclosure by respondents
- Aggregate-only analysis with k-anonymity
- Example: "Average rating by age group"

### 6. 📈 Advanced Statistics

**Current State**: Basic operations (sum, average, count)

**Potential Operations:**
- Standard deviation and variance
- Median and mode
- Correlation between questions
- Conditional statistics

**Challenge**: FHE computational complexity and gas costs increase significantly.

### 7. ⚙️ BeaconProxy Pattern

**Issue**: [Reported to Zama Team](https://discord.com/channels/1287736665103798433/1315252078758858783/1412062254622314597)

**Problem**: BeaconProxy implementation causes FHE decryption failures

**Current Workaround**: Using direct contract deployment

**Impact if Resolved**:
- ~80% reduction in deployment gas costs
- Ability to upgrade contracts without data migration
- Standardized interface across all surveys

**Status**: Awaiting feedback from Zama team on fhEVM compatibility with proxy patterns

---

## 🤝 Contributing

Contributions are very welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/feature-name`
5. Open a Pull Request

---

## 📄 License

This project uses **MIT License**.

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
