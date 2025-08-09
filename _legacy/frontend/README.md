# 🔒 Fhedback

**Confidential Surveys on Zama FHEVM**

Fhedback is a privacy-first survey platform built on Zama's Fully Homomorphic Encryption (FHE) technology. Create and respond to surveys with complete anonymity and data protection.

## ✨ Features

- 🛡️ **Complete Privacy**: All responses are encrypted using FHE technology
- 🎯 **Anonymous Feedback**: No personal data collection, only statistical insights
- 🔗 **Web3 Integration**: Connect with your wallet to create and manage surveys
- 📊 **Real-time Analytics**: View aggregated results without compromising individual privacy
- 🎨 **Modern UI**: Clean, responsive design with dark/light mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/erzawansyah/fhedback.git
cd fhedback
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📋 Developer Guidelines

### 🎯 Project Overview

Fhedback is a Next.js-based survey platform that leverages:
- **Zama FHEVM** for fully homomorphic encryption
- **Modern React patterns** with hooks and context
- **Component-driven architecture** using shadcn/ui
- **Type-safe development** with TypeScript

### 🏃‍♂️ Quick Start for Developers

1. **Understand the Architecture**:
   ```
   Frontend (Next.js/React) → FHE Relayer → Zama FHEVM → Smart Contracts
   ```

2. **Key Entry Points**:
   - `src/app/page.tsx` - Homepage/Dashboard
   - `src/app/creator/new/page.tsx` - Survey creation flow
   - `src/app/explore/page.tsx` - Browse surveys
   - `src/app/view/[address]/page.tsx` - Survey response interface

3. **Core Components to Study**:
   - `src/components/survey-creation/` - Survey creation wizard
   - `src/components/survey-explore/` - Survey browsing
   - `src/components/survey-view/` - Survey response forms
   - `src/context/SurveyCreationContext.tsx` - Global state management

### 🔧 Development Workflow

#### Before You Start:
1. **Read the codebase structure**:
   - Check `FOLDER_STRUCTURE_GUIDE.md` for detailed folder explanations
   - Review `DESIGN_SYSTEM_GUIDE.md` for UI guidelines

2. **Set up your environment**:
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment template
   cp .env.example .env.local
   
   # Start development server
   npm run dev
   ```

3. **Connect a wallet**:
   - Install MetaMask or compatible wallet
   - Connect to Zama testnet
   - Get test tokens for interactions

#### Development Best Practices:

**🎨 UI Development:**
- Use components from `src/components/ui/` (shadcn/ui based)
- Follow the design system patterns in existing components
- Test both light and dark modes
- Ensure mobile responsiveness

**⚛️ React Patterns:**
- Use custom hooks from `src/hooks/`
- Leverage context providers for global state
- Follow the established component structure
- Use TypeScript interfaces from `src/types/`

**🔒 FHE Integration:**
- Study `src/lib/fhe-relayer/` for encryption patterns
- Use existing contract ABIs in `src/lib/contracts/`
- Test encryption/decryption flows thoroughly
- Handle loading states for blockchain operations

**📝 Survey Creation Flow:**
```
1. Survey Settings (privacy, rewards, limits)
2. Survey Metadata (title, description, tags)
3. Survey Questions (question types, validation)
4. Review & Deploy (smart contract deployment)
```

### 🚀 Common Development Tasks

#### Adding a New Page:
```bash
# Create page file
touch src/app/your-page/page.tsx

# Add to sidebar navigation
# Edit: src/components/app-sidebar.tsx
```

#### Creating a New Component:
```bash
# Create component file
touch src/components/your-component/YourComponent.tsx

# Export from index
echo "export { YourComponent } from './YourComponent'" >> src/components/your-component/index.ts
```

#### Adding a New Hook:
```bash
# Create hook file
touch src/hooks/useYourHook.ts

# Export from index
# Edit: src/hooks/index.ts
```

### 🔍 Key Areas to Focus On

#### For Frontend Developers:
- **Survey Creation Wizard** (`src/components/survey-creation/`)
- **Response Interface** (`src/components/survey-view/`)
- **Dashboard & Analytics** (`src/app/creator/`)

#### For Blockchain Developers:
- **Smart Contract Integration** (`src/lib/contracts/`)
- **FHE Encryption Logic** (`src/lib/fhe-relayer/`)
- **Web3 Configuration** (`src/lib/wagmi/`)

#### For Full-Stack Developers:
- **Context Management** (`src/context/`)
- **Custom Hooks** (`src/hooks/`)
- **API Integration** (`src/app/api/`)

### 🧪 Testing Your Changes

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Test wallet connection flow
# Test survey creation end-to-end
# Test survey response submission
# Test analytics display
```

### 🐛 Common Issues & Solutions

1. **Build Errors**: Usually TypeScript issues
   - Check imports and exports
   - Verify component prop types
   - Run `npm run type-check`

2. **Wallet Connection Issues**:
   - Ensure correct network configuration
   - Check RainbowKit setup in `src/lib/wagmi/`
   - Verify environment variables

3. **FHE Encryption Errors**:
   - Check relayer configuration
   - Verify contract ABI versions
   - Test with proper test data

### 📚 Learning Resources

- **Zama FHE**: [docs.zama.ai](https://docs.zama.ai)
- **Next.js App Router**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui Components**: [ui.shadcn.com](https://ui.shadcn.com)
- **Wagmi Web3 Hooks**: [wagmi.sh](https://wagmi.sh)

### 🎯 Next Steps for New Contributors

1. **Week 1**: Explore the codebase, run the project locally
2. **Week 2**: Create a simple survey, test the full flow
3. **Week 3**: Make small UI improvements or bug fixes
4. **Week 4+**: Tackle larger features or optimizations

### 💡 Feature Ideas to Implement
- [ ] Survey templates
- [ ] Advanced question types
- [ ] Real-time collaboration
- [ ] Mobile app
- [ ] Survey analytics dashboard
- [ ] Integration with other platforms

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Zama FHEVM, Wagmi, RainbowKit
- **Encryption**: Fully Homomorphic Encryption (FHE)
- **State Management**: React Context, Custom Hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── survey-creation/  # Survey creation components
│   ├── survey-explore/   # Survey browsing components
│   └── survey-view/      # Survey response components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── contracts/        # Smart contract ABIs
│   ├── fhe-relayer/     # FHE encryption utilities
│   └── wagmi/           # Web3 configuration
└── types/               # TypeScript type definitions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌐 Deployment

The easiest way to deploy Fhedback is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/erzawansyah/fhedback)

Alternatively, you can deploy to any platform that supports Next.js applications.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/erzawansyah/fhedback/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/erzawansyah/fhedback/discussions)

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for FHE technology
- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
