# 🎨 FHEdback Frontend - React Application

> Modern React frontend for FHEdback confidential survey platform with Fully Homomorphic Encryption (FHE)

[![React](https://img.shields.io/badge/React-19.1.0-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646cff?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Configuration](#️-configuration)
- [🛠️ Development](#️-development)
- [📦 Tech Stack](#-tech-stack)
- [🧩 Code Organization](#-code-organization)
- [🎨 UI Components](#-ui-components)
- [🌐 Routing](#-routing)
- [🔗 Smart Contract Integration](#-smart-contract-integration)
- [📊 State Management](#-state-management)
- [📝 Scripts](#-scripts)
- [🧪 Testing](#-testing)
- [🏗️ Build & Deployment](#️-build--deployment)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [🏆 Zama Developer Program](#-zama-developer-program)

---

## 🌟 Overview

FHEdback Frontend is a modern web application built with React 19, TypeScript, and Vite. It provides a user interface for creating, managing, and participating in confidential surveys using **Fully Homomorphic Encryption (FHE)** technology from **Zama**.

### 🎯 About This Project

This project is developed as part of the **Zama Developer Program**, showcasing the practical implementation of **fhEVM (Fully Homomorphic Encryption Virtual Machine)** for building privacy-preserving decentralized applications. FHEdback demonstrates how FHE technology can solve real-world privacy challenges in survey and voting systems.

**Key Highlights:**
- 🔐 **Privacy-First**: Survey responses remain encrypted on-chain, even during computation
- ⛓️ **Blockchain Native**: Built on Ethereum-compatible networks using Zama's fhEVM
- 🔬 **Production Ready**: Demonstrates real-world FHE application beyond proof-of-concepts
- 🌐 **Web3 Integration**: Seamless wallet connection and smart contract interaction

> **⚠️ Note on Storage**: Currently, this project uses **Firebase** for testing and development purposes. The ideal solution is to use **IPFS** for fully decentralized storage. However, the project architecture has been designed with abstraction layers that allow for easy migration to IPFS in the future with minimal code changes.

---

## ✨ Features

### 🎯 Core Features

- **Survey Creation**
  - Form wizard for creating surveys
  - Rating question type (1-5 scale)
  - Metadata storage integration (Firebase/IPFS)
  - Real-time validation with Zod

- **Survey Management**
  - Dashboard for survey creators
  - Edit and publish surveys
  - View statistics and analytics
  - Close and delete surveys (only before publication)

- **Response Submission**
  - Encrypted response submission
  - Progress tracking
  - Transaction confirmation

### 🔒 Privacy Features

- Client-side encryption before submission
- FHE operations for statistical analysis
- Zero-knowledge proofs for validation
- Respondent anonymity

### 🌐 Web3 Features

- Wallet connection with RainbowKit
- Multi-wallet support (MetaMask, WalletConnect, etc.)
- Transaction management

---

## 🏗️ Project Structure

```
frontend/
├── 📁 public/                  # Static assets
├── 📁 scripts/                 # Build and setup scripts
│
├── 📁 src/
│   ├── 📄 main.tsx            # Entry point
│   ├── 📄 App.tsx             # Root component
│   │
│   ├── 📁 components/         # React components
│   │   └── 📁 ui/             # Reusable UI primitives (30+ components)
│   │
│   ├── 📁 hooks/              # Custom React hooks
│   │
│   ├── 📁 routes/             # TanStack Router routes (file-based)
│   │
│   ├── 📁 services/           # External service integrations
│   │   ├── wagmi.ts           # Wagmi configuration
│   │   ├── 📁 contracts/      # Smart contract services
│   │   ├── 📁 fhevm/          # FHEVM services
│   │   └── 📁 firebase/       # Firebase services
│   │
│   ├── 📁 types/              # TypeScript type definitions
│   │   ├── survey.d.ts        # Survey types
│   │   └── survey.schema.ts   # Survey schemas (Zod)
│   │
│   ├── 📁 utils/              # Utility functions
│   │
│   ├── 📁 fhevm-react/        # FHEVM React integration module
│   │
│   ├── 📁 context/            # React contexts
│   └── 📁 assets/             # Images, icons, fonts
│
├── � tests/                  # Test files
│
├── 📄 package.json            # Dependencies & scripts
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tsconfig.json           # TypeScript config
└── 📄 .env.local              # Environment variables (gitignored)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 7.0.0 or higher
- **MetaMask** or other Web3 wallet
- **Git** for version control

### Installation

1. **Clone repository** (if not already):
   ```bash
   git clone https://github.com/erzawansyah/fhedback.git
   cd fhedback/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure `.env.local`**:
   ```env
   # Firebase Configuration (Currently used for testing)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # ReCAPTCHA (Optional - for bot protection)
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   VITE_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

   # WalletConnect (Required for wallet connection)
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:5173`

---

## ⚙️ Configuration

### Environment Variables

The frontend uses environment variables defined in `vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  // App Info
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_NODE_ENV: string
  
  // API & Network
  readonly VITE_API_BASE_URL: string
  readonly VITE_ZAMA_TESTNET_RPC: string
  readonly VITE_ZAMA_RELAYER_URL: string
  
  // IPFS (Future implementation)
  readonly VITE_PINATA_JWT: string
  readonly VITE_PINATA_GATEWAY_URL: string
  
  // Web3
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  
  // Analytics
  readonly VITE_ANALYTICS_ID: string
}
```

### Storage Architecture

**Current Implementation (Testing):**
- Firebase for metadata and survey data storage
- Abstracted through service layer in `src/services/`

**Future Migration Path:**
- IPFS for fully decentralized storage
- Easy migration due to abstracted storage service
- Minimal code changes required (only in `src/services/storage.ts`)

**Why this approach?**
- Faster development and testing with Firebase
- Clear separation of concerns
- Production-ready architecture for IPFS migration
- Service layer abstracts storage implementation details

### Survey Data Structure

FHEdback uses two separate JSON structures to manage survey data: **metadata** and **questions**. These are stored off-chain (currently Firebase, future IPFS) with CIDs/references stored on-chain in the smart contract.

> **📝 Note on Form Simplification**: The survey creation form in the platform is designed to be **simple and user-friendly**. Not all fields shown in the JSON structure examples below are currently used or required in the form. This simplified approach makes it easier for users to create surveys quickly. Additional fields are available in the data structure for future enhancements and advanced features.

#### Metadata Structure

Survey metadata contains general information and configuration:

```json
{
  "title": "Survey Title Example",
  "description": "This is an example of a survey description that provides context and instructions for participants.",
  "language": "en",
  "category": "General Category",
  "instructions": "Please answer all questions to the best of your ability.",
  "targetAudience": [
    {
      "name": "Age",
      "value": "18-24"
    },
    {
      "name": "Location",
      "value": "Global"
    },
    {
      "name": "Gender",
      "value": "All"
    }
  ],
  "tags": [
    "example",
    "survey",
    "metadata"
  ]
}
```

**Metadata Fields:**
- `title` (string): Survey title displayed to users
- `description` (string): Detailed description of the survey purpose
- `language` (string): Survey language code (ISO 639-1)
- `category` (string): Survey category for classification
- `instructions` (string): Instructions for participants
- `targetAudience` (array): Target demographic information
  - `name` (string): Demographic field name (e.g., "Age", "Location", "Gender")
  - `value` (string): Target value for this field
- `tags` (array): Tags for search and categorization

#### Questions Structure

Questions array contains the survey questions with response configuration:

```json
[
  {
    "id": 0,
    "text": "How satisfied are you with our service?",
    "helperText": "1 is Not Satisfied, 10 is Very Satisfied",
    "response": {
      "type": "rating",
      "minScore": 1,
      "maxScore": 10,
      "minLabel": "Not Satisfied",
      "maxLabel": "Very Satisfied"
    }
  },
  {
    "id": 1,
    "text": "How likely are you to recommend us to a friend?",
    "helperText": "1 is Not Likely, 10 is Very Likely",
    "response": {
      "type": "rating",
      "minScore": 1,
      "maxScore": 10,
      "minLabel": "Not Likely",
      "maxLabel": "Very Likely"
    }
  }
]
```

**Question Fields:**
- `id` (number): Unique identifier for the question (0-indexed)
- `text` (string): The question text displayed to respondents
- `helperText` (string): Optional helper text explaining the rating scale
- `response` (object): Response configuration
  - `type` (string): Currently supports "rating" type
  - `minScore` (number): Minimum rating value
  - `maxScore` (number): Maximum rating value
  - `minLabel` (string): Label for minimum score (e.g., "Not Satisfied")
  - `maxLabel` (string): Label for maximum score (e.g., "Very Satisfied")

**Current Response Type:**
Currently, FHEdback supports **rating** type questions with configurable score ranges (typically 1-10 scale). Future versions may include:
- Multiple choice questions
- Text responses (with FHE encryption)
- Yes/No questions
- Ranking questions

#### Data Flow

1. **Survey Creation:**
   - Creator fills metadata form (title, description, etc.)
   - Creator adds questions with rating configuration
   - Frontend uploads metadata JSON to storage
   - Frontend uploads questions JSON to storage
   - Smart contract stores CIDs/references + question count

2. **Survey Response:**
   - Respondent fetches metadata and questions from storage
   - Respondent submits encrypted ratings (FHE encrypted)
   - Smart contract stores encrypted responses on-chain

3. **Statistics Retrieval:**
   - Smart contract performs FHE operations on encrypted data
   - Returns aggregated statistics (total, sum, average, etc.)
   - Frontend displays statistics without revealing individual responses

**Example Files:**
- Metadata: `src/assets/json/metadata-example.json`
- Questions: `src/assets/json/questions-example.json`
- Stats Response: `src/assets/json/stats.json`

### Contract Addresses

Contract addresses and ABIs are configured in `src/services/contracts/index.ts`:

```typescript
// Main factory address for frontend integration
export const FACTORY_ADDRESS: Address = "0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15"

// Contract ABIs
export const ABIS = {
    survey: survey_abi,    // Individual survey contract
    factory: factory_abi   // Survey factory contract
}

// Helper functions
export function getFactoryContract() {
    return {
        address: FACTORY_ADDRESS,
        abi: factory_abi
    }
}
```

**Contract Deployment Details:**
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Factory Address**: `0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15`
- **Status**: ✅ Verified on Sepolia Blockscout
- **ABIs Location**: `src/services/contracts/abis/`

### Wagmi Configuration

Web3 configuration in `src/services/wagmi.ts`:

```typescript
const config = getDefaultConfig({
  appName: 'FHEdback',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [sepolia],
  // ...
})
```

---

## 🛠️ Development

### Development Server

```bash
npm run dev
```

Development server with HMR (Hot Module Replacement) runs at `http://localhost:5173`

### Type Checking

```bash
npm run type-check
```

Run TypeScript compiler for type validation without emitting files.

### Linting

```bash
# Check for errors
npm run lint

# Auto-fix errors
npm run lint:fix
```

### Formatting

```bash
# Check formatting
npm run format:check

# Auto-format files
npm run format
```

### Clean Build Artifacts

```bash
npm run clean
```

Remove `dist/` and temporary files.

---

## 📦 Tech Stack

### Core Framework

- **React 19.1.0** - Modern UI library with concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 7.0.4** - Lightning-fast build tool & dev server

### Routing & Data Fetching

- **TanStack Router 1.130.12** - Type-safe file-based routing
- **TanStack Query 5.90.5** - Powerful data fetching & caching
- **TanStack Router Devtools** - Development tools for debugging

### Styling

- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
  - Accordion, AlertDialog, Avatar, Checkbox, Dialog
  - Dropdown, Label, Progress, Radio, ScrollArea
  - Select, Separator, Slider, Switch, Tabs, Tooltip
- **Class Variance Authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class names
- **Lucide React** - Beautiful icon library

### Web3 & Blockchain

- **Wagmi 2.19.1** - React hooks for Ethereum
- **Viem 2.38.5** - TypeScript interface for Ethereum
- **RainbowKit 2.2.9** - Wallet connection UI
- **Ethers.js 6.15.0** - Ethereum library

### Privacy & Encryption (Zama FHE)

- **@zama-fhe/relayer-sdk 0.2.0** - Fully Homomorphic Encryption relayer integration
- **@fhevm/mock-utils 0.1.0** - FHE testing utilities for development
- **fhEVM** - Ethereum-compatible blockchain with native FHE support

**About Zama's fhEVM:**
Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine) enables confidential smart contracts where data remains encrypted during computation. This allows FHEdback to:
- Process survey responses without revealing individual answers
- Compute statistics (averages, counts) on encrypted data
- Maintain respondent privacy at the protocol level
- Enable trustless, verifiable computations on sensitive data

**Learn More:**
- [Zama Documentation](https://docs.zama.ai/)
- [fhEVM Whitepaper](https://github.com/zama-ai/fhevm)
- [Zama Developer Program](https://www.zama.ai/developer-program)

### Forms & Validation

- **React Hook Form 7.62.0** - Performant form handling
- **Zod 3.25.76** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.1** - Form validation resolvers

### Storage & Backend Services

- **Pinata 2.4.9** - IPFS file storage (ready for migration)
- **Firebase 12.1.0** - Backend services (current testing implementation)

> **Storage Strategy**: Firebase is used for rapid development and testing. The architecture supports seamless migration to IPFS through abstracted storage services in `src/services/storage.ts`.

### UI Enhancement

- **Motion 12.23.24** - Animation library
- **Recharts 3.1.0** - Composable charting library
- **Embla Carousel 8.6.0** - Carousel component
- **Sonner 2.0.7** - Toast notifications
- **Next Themes 0.4.6** - Theme management

### Development Tools

- **ESLint 9.30.1** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting rules


---

## 🌐 Routing

Using **TanStack Router** with file-based routing:

### Route Structure

```
routes/
├── __root.tsx              # Root layout
├── index.tsx               # Home: /
├── survey.create.tsx       # Create: /survey/create
├── survey.view.$addr.tsx   # View: /survey/view/:addr
├── survey.stats.$addr.tsx  # Stats: /survey/stats/:addr
├── surveys.me.tsx          # My Surveys: /surveys/me
├── surveys.explore.tsx     # Explore: /surveys/explore
└── edit-survey.tsx         # Edit: /edit-survey
```

### Route Parameters

```typescript
// survey.view.$addr.tsx
export const Route = createFileRoute('/survey/view/$addr')({
  component: SurveyView,
})

// Access params
function SurveyView() {
  const { addr } = Route.useParams()
  // ...
}
```

### Navigation

```typescript
import { useNavigate } from '@tanstack/react-router'

function MyComponent() {
  const navigate = useNavigate()
  
  const goToSurvey = (address: string) => {
    navigate({ to: '/survey/view/$addr', params: { addr: address } })
  }
}
```

---

## 🔗 Smart Contract Integration

### Contract Configuration

Contract integration is managed through `src/services/contracts/index.ts`:

```typescript
import { FACTORY_ADDRESS, ABIS, getFactoryContract } from '@/services/contracts'

// Factory contract configuration
const factoryContract = getFactoryContract()
// Returns: { address: "0x24405...", abi: [...] }

// Individual survey ABI
const surveyABI = ABIS.survey
```

### Reading from Contracts

```typescript
import { useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'

function MySurveys() {
  const { data: surveys } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: ABIS.factory,
    functionName: 'getSurveysByOwner',
    args: [userAddress],
  })
}
```

### Writing to Contracts

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'

function CreateSurvey() {
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })
  
  const createSurvey = async () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: ABIS.factory,
      functionName: 'createSurvey',
      args: [owner, symbol, metadataCID, questionsCID, totalQuestions, limit],
    })
  }
}
```

### Helper Functions

The contracts module provides utility functions:

```typescript
import { 
  formatSurveyStatus, 
  getSurveyStatusColor,
  canModifySurvey,
  formatAddress 
} from '@/services/contracts'

// Format status: 0 → "Created", 1 → "Active", etc.
const status = formatSurveyStatus(0) // "Created"

// Get status color for UI
const colorClass = getSurveyStatusColor(1) // "bg-green-100 text-green-800"

// Check if survey can be modified
const editable = canModifySurvey(0) // true (only Created surveys)

// Format address for display
const short = formatAddress("0x1234...5678", 4) // "0x12...5678"
```

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server dengan HMR |
| `npm run build` | Production build (TypeScript + Vite) |
| `npm run build:strict` | Build dengan strict type checking |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint untuk check errors |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code dengan Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | TypeScript type validation |
| `npm run clean` | Clean build artifacts |
| `npm run setup` | Run setup script (Linux/Mac) |

---

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

### Build Analysis

```bash
npm run build
# Check dist/ folder size
du -sh dist/
```

### Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Manual Deployment

```bash
# Build
npm run build

# Upload dist/ folder to hosting
# Make sure to configure rewrites for SPA routing
```

### Environment Variables for Production

Set in hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

**Migration to IPFS:**
When ready to migrate from Firebase to IPFS:
1. Update `src/services/storage.ts` with IPFS implementation
2. Replace Firebase config with Pinata/IPFS config
3. No changes needed in components (abstraction layer handles it)

---

## 🔧 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. TypeScript errors**
```bash
# Clear TypeScript cache
rm -rf .tanstack node_modules/.tmp
npm run type-check
```

**3. Vite HMR not working**
```bash
# Restart dev server
# Check if port 5173 is available
```

**4. Wallet connection issues**
- Check `VITE_WALLET_CONNECT_PROJECT_ID` in `.env.local`
- Verify wallet network (should be Sepolia)
- Clear browser cache & wallet cache

**5. Storage upload failures**
- Verify Firebase credentials in `.env.local`
- Check Firebase project permissions
- For IPFS migration: Verify `VITE_PINATA_JWT` token
- Test with smaller files first

### Debug Mode

Enable debug logs:
```typescript
// In your component
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

---

## 🤝 Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Follow code style**
   ```bash
   npm run lint
   npm run format
   npm run type-check
   ```

3. **Test your changes**
   ```bash
   npm run test
   npm run build # Ensure builds successfully
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new survey filter"
   git commit -m "fix: resolve wallet connection issue"
   ```

5. **Push & create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Code Style Guidelines

- Use TypeScript strictly (no `any` types)
- Follow import order convention
- Use functional components with hooks
- Prefer composition over inheritance
- Write self-documenting code with clear naming
- Add JSDoc comments for complex functions
- Keep components small and focused
- Extract reusable logic to custom hooks

### Component Guidelines

- One component per file
- Use TypeScript interfaces for props
- Extract complex logic to custom hooks
- Use Radix UI primitives for accessibility
- Follow responsive design patterns
- Test components in isolation

### Storage Service Guidelines

When working with storage services:
- Use abstracted storage service from `src/services/storage.ts`
- Don't directly import Firebase/IPFS in components
- Keep storage implementation details in service layer
- This ensures easy migration between storage providers

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support & Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Router](https://tanstack.com/router)
- [Wagmi Documentation](https://wagmi.sh/)
- [TailwindCSS](https://tailwindcss.com/docs)

### Project Resources
- **Main README**: `../README.md`
- **Contracts README**: `../contracts/README.md`
- **Test Results**: `../contracts/TEST_RESULTS.md`

### Getting Help
- Open an issue on GitHub
- Check existing documentation
- Review code examples in `src/`

### Roadmap
- ✅ Firebase implementation for testing
- 🔄 Service layer abstraction (completed)
- ⏳ IPFS migration (planned)
- ⏳ Enhanced privacy features
- ⏳ Mobile optimization

---

### Resources for Developers

**Zama Resources:**
- 📚 [Zama Documentation](https://docs.zama.ai/)
- 🛠️ [fhEVM GitHub](https://github.com/zama-ai/fhevm)
- 🎓 [Zama Developer Program](https://www.zama.ai/developer-program)

**This Project:**
- 📖 [Smart Contracts Documentation](../contracts/README.md)
- 🧪 [Smart Contracts Test Results](../contracts/TEST_RESULTS.md)
- 💻 [GitHub Repository](https://github.com/erzawansyah/fhedback)

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

**Built with ❤️ by FHEdback Team**

**Powered by Zama's fhEVM** 🔐
