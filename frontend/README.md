# 🔐 FHEdback - Confidential Survey Platform

A privacy-first survey platform built with **Fully Homomorphic Encryption (FHE)** using Zama's FHEVM, enabling completely confidential surveys where individual responses remain encrypted while allowing statistical analysis.

## 🏗️ Project Structure

```
fhedback_vite/
├── 📁 public/                 # Static assets
│   └── vite.svg
├── 📁 src/
│   ├── 📁 assets/            # Images, icons, and static resources
│   │   ├── images/          # Image files
│   │   └── icons/           # Icon files
│   ├── 📁 components/        # React components
│   │   ├── ui/             # Reusable UI components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, footer, sidebar)
│   │   └── forms/          # Form-specific components
│   ├── 📁 context/          # React Context providers for global state
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 lib/              # External library configurations and CSS
│   ├── 📁 routes/           # Route components (TanStack Router)
│   ├── 📁 services/         # External services integration
│   │   ├── api/            # API calls and data fetching
│   │   └── blockchain/     # Blockchain integration (Wagmi, Ethers)
│   ├── 📁 stores/           # State management (Zustand, Redux, etc.)
│   ├── 📁 types/            # TypeScript type definitions
│   ├── 📁 utils/            # Utility functions and helpers
│   ├── 📁 constants/        # Application constants and configurations
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type definitions
├── 📁 tests/                # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── 📁 docs/                 # Documentation
├── 📁 scripts/              # Build and utility scripts
├── 📁 .vscode/              # VS Code configuration
├── 📄 .env.example          # Environment variables template
└── 📄 Configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fhedback_vite
   ```

2. **Run setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

   Or manually:
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Development Guidelines

### Folder Organization
- **Components**: Organize by feature or type (ui, layout, forms)
- **Services**: Separate API calls from blockchain interactions
- **Types**: Centralize TypeScript definitions
- **Utils**: Keep utility functions pure and testable
- **Constants**: Store configuration and static values

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Write meaningful component and function names
- Keep components small and focused
- Use custom hooks for complex logic

### Import Organization
```typescript
// 1. React and external libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (components, hooks, utils)
import { Button } from '@/components/ui';
import { useWallet } from '@/hooks';
import { cn } from '@/utils';

// 3. Types
import type { Survey } from '@/types';
```

## 🧪 Testing

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

```bash
npm run test          # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration # Run integration tests only
```

## 📦 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **TailwindCSS v4** - Styling framework

### UI Components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variants
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Blockchain & Privacy
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Ethers.js** - Ethereum library
- **Zama FHE Relayer SDK** - Fully Homomorphic Encryption
- **RainbowKit** - Wallet connection

### Data & Storage
- **TanStack Query** - Data fetching and caching
- **Pinata** - IPFS file storage
- **Recharts** - Data visualization

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```env
# App Configuration
VITE_APP_NAME=FhedBack
VITE_APP_VERSION=1.0.0

# Blockchain
VITE_ZAMA_TESTNET_RPC=https://devnet.zama.ai
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS
VITE_PINATA_JWT=your_pinata_jwt
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

### VS Code Setup
Recommended extensions are automatically suggested. The workspace includes:
- TypeScript support
- TailwindCSS IntelliSense
- ESLint integration
- Prettier formatting
- Auto imports

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `scripts/setup.sh` - Development environment setup
- `scripts/build.sh` - Production build script

## 🤝 Contributing

1. Follow the established folder structure
2. Write tests for new features
3. Use TypeScript strictly
4. Follow the import organization guidelines
5. Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For development questions, check the `docs/` folder or create an issue.
