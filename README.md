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
