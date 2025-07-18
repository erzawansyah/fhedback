# FHE Survey Platform Frontend

A modern, privacy-focused survey platform built with Next.js and Fully Homomorphic Encryption (FHE) technology. This decentralized application enables users to create, participate in, and analyze surveys while maintaining complete privacy through blockchain technology.

## 🚀 Features

- **🔐 Privacy-First**: Leverages Fully Homomorphic Encryption for secure data processing
- **🌐 Web3 Integration**: Built on Ethereum with RainbowKit wallet connection
- **📱 Responsive Design**: Mobile-first approach with dark/light theme support
- **⚡ Modern Stack**: Next.js 15 with App Router, React 19, and TypeScript 5
- **🎨 Beautiful UI**: Custom design system with Tailwind CSS and Radix UI components
- **📊 Real-time Analytics**: Live survey statistics and progress tracking
- **🔄 Interactive Forms**: Dynamic survey creation with validation

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.4.1** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variant management
- **next-themes** - Theme switching with system preference detection

### Web3 & Blockchain
- **Wagmi 2.15.6** - React hooks for Ethereum
- **RainbowKit 2.2.8** - Wallet connection interface
- **Viem 2.31.7** - TypeScript interface for Ethereum
- **Sepolia Testnet** - Development blockchain network

### Forms & Validation
- **React Hook Form 7.60.0** - Performant forms with easy validation
- **Zod 3.25.76** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolvers for React Hook Form

### Additional Libraries
- **@tanstack/react-query 5.83.0** - Data fetching and caching
- **Embla Carousel** - Touch-friendly carousel component
- **Sonner** - Beautiful toast notifications

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # Global providers wrapper
│   ├── statistic/           # Survey statistics pages
│   ├── submit/              # Survey submission pages
│   ├── survey/              # Survey management pages
│   └── test/                # Testing and development pages
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (shadcn/ui style)
│   ├── sections/            # Page sections and layouts
│   └── stars/               # Special effect components
├── context/                 # React Context providers
│   ├── SurveyContext.tsx    # Survey data management
│   ├── UIContext.tsx        # Theme and UI state
│   └── Web3Providers.tsx    # Web3 and wallet providers
├── hooks/                   # Custom React hooks
│   └── useSurvey.ts         # Survey-related hooks
├── lib/                     # Core utilities and configurations
│   ├── constants/           # Application constants
│   ├── contracts/           # Smart contract ABIs and configs
│   ├── interfaces/          # TypeScript interfaces
│   ├── mockups/             # Mock data for development
│   ├── types/               # Global type definitions
│   ├── wagmi/               # Web3 configuration
│   └── utils/               # Utility functions
└── utils/                   # Additional utilities
    ├── cn.ts                # Class name utility
    ├── createSurvey.ts      # Survey creation logic
    ├── general.ts           # General utilities
    ├── getSurveys.ts        # Survey fetching logic
    ├── signatureHandler.ts  # Signature management
    └── verifySignature.ts   # Signature verification
```

## 🎨 Design System

The project uses a comprehensive design system built with CSS custom properties and Tailwind CSS:

### Color Palette
- **Primary**: Blue gradient system for main actions
- **Secondary**: Muted tones for secondary elements
- **Accent**: Highlight colors for interactive elements
- **Neutral**: Grayscale system for text and backgrounds

### Theme Support
- **Light Mode**: Clean, minimal design with high contrast
- **Dark Mode**: Modern dark theme with blue accents
- **System**: Automatic theme detection based on user preference

### Typography
- **Geist Font Family**: Modern, readable typeface optimized for screens
- **Responsive Scale**: Fluid typography that scales with viewport

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager
- Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd questionnaire_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Development with Turbopack
The project is configured to use Turbopack for faster development builds:
```bash
npm run dev  # Automatically uses --turbopack flag
```

## 📱 Key Features & Usage

### 🔗 Wallet Connection
- Connect your Web3 wallet using RainbowKit
- Supports MetaMask, WalletConnect, and other popular wallets
- Automatic network switching to Sepolia testnet

### 📋 Survey Creation
1. Navigate to `/survey/create`
2. Fill in survey details (title, description, limits)
3. Add questions with Likert scale responses
4. Deploy to blockchain for immutable storage

### 📊 Survey Participation
1. Browse available surveys on the home page
2. Connect your wallet to participate
3. Submit encrypted responses using FHE technology
4. View confirmation and transaction details

### 📈 Analytics & Statistics
- Real-time survey statistics
- Response tracking and progress indicators
- Privacy-preserving data analysis

## 🏗️ Architecture

### Component Architecture
- **Modular Design**: Each component has a single responsibility
- **Composition Pattern**: Small, reusable components that compose into larger features
- **Props Interface**: Strongly typed props with TypeScript interfaces
- **Accessibility**: ARIA attributes and keyboard navigation support

### State Management
- **React Context**: Global state for theme and survey data
- **Local State**: Component-level state with React hooks
- **React Query**: Server state management and caching
- **Form State**: React Hook Form for complex form management

### Web3 Integration
- **Wagmi**: React hooks for Ethereum interaction
- **RainbowKit**: Wallet connection and management
- **Smart Contracts**: Integration with FHE questionnaire contracts
- **Type Safety**: Full TypeScript support for contract interactions

## 🔧 Development

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js recommended rules
- **Consistent Formatting**: Standardized code style
- **Error Boundaries**: Graceful error handling

### Performance Optimizations
- **Next.js App Router**: Server-side rendering and streaming
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with optimization
- **Caching**: React Query for efficient data fetching

### Testing & Debugging
- Development pages at `/test` for component testing
- Browser DevTools integration
- TypeScript compiler for compile-time error detection

## 🌐 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Vercel Deployment (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Environment Configuration
Make sure to set up the following environment variables in production:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the established design system
- Write meaningful commit messages
- Ensure all components are accessible
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** - For FHE technology and blockchain privacy solutions
- **Next.js Team** - For the amazing React framework
- **RainbowKit** - For seamless Web3 wallet integration
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Join our community discussions

---

Built with ❤️ using Next.js and FHE technology for privacy-preserving surveys.
