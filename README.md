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

## 📞 Contact

- **Repository**: [github.com/erzawansyah/fhedback](https://github.com/erzawansyah/fhedback)
- **Live Demo**: [fhedback.vercel.app](https://fhedback.vercel.app)
- **Owner**: [@erzawansyah](https://github.com/erzawansyah)

---

**Built with ❤️ using Zama's Fully Homomorphic Encryption**
