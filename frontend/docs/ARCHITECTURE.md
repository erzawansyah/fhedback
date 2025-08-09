# FhedBack Architecture

## Overview
FhedBack is a privacy-preserving survey platform that uses Fully Homomorphic Encryption (FHE) to ensure respondent privacy while still allowing for meaningful data analysis.

## Key Features
- **Privacy-First**: FHE encryption protects respondent data
- **Blockchain Integration**: Decentralized storage and verification
- **Modern UI**: Built with React 19 and TailwindCSS v4
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized with Vite and modern bundling

## Architecture Layers

### Frontend Layer
- **React 19**: Modern UI framework with concurrent features
- **TanStack Router**: Type-safe routing solution
- **TailwindCSS v4**: Utility-first styling framework
- **Radix UI**: Accessible component primitives

### State Management
- **TanStack Query**: Server state management and caching
- **React Context**: Global application state
- **Custom Hooks**: Reusable stateful logic

### Blockchain Layer
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum interface
- **RainbowKit**: Wallet connection UI
- **Zama FHE**: Homomorphic encryption for privacy

### Storage Layer
- **IPFS/Pinata**: Decentralized file storage
- **Local Storage**: Browser-based persistence
- **Blockchain**: Immutable data storage

## Data Flow

```
User Input → FHE Encryption → IPFS Storage → Blockchain Verification → Analytics Dashboard
```

## Security Considerations
- All sensitive data encrypted with FHE
- Wallet-based authentication
- Immutable audit trail on blockchain
- No plaintext storage of responses

## Development Principles
- **Privacy by Design**: Default encryption for all data
- **Mobile First**: Responsive design principles
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized bundle sizes and loading
- **Testing**: Comprehensive test coverage
