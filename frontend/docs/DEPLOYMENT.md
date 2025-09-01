# 🚀 FHEdback Deployment Guide

This guide covers deploying FHEdback to various environments, from local development to production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher  
- **Git**: Latest version
- **Metamask**: Browser extension for wallet interactions
- **Hardhat**: For smart contract deployment

### Network Requirements
- **Sepolia Testnet**: For contract deployment
- **IPFS/Pinata**: For metadata storage
- **Vercel/Netlify**: For frontend hosting (optional)

## 🏗️ Smart Contract Deployment

### 1. Environment Setup

Create a `.env` file in the `contracts` directory:

```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
MNEMONIC=your_twelve_word_mnemonic_here

# Network URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_key

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
INFURA_API_KEY=your_infura_project_id

# FHEVM Configuration
FHEVM_ENABLED=true
```

### 2. Pre-deployment Steps

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Check deployment configuration
npm run check-env

# Run tests
npm test
```

### 3. Deploy to Sepolia Testnet

```bash
# Deploy all contracts
npx hardhat run deploy/01_deploy_all.ts --network sepolia

# Or deploy step by step
npx hardhat run deploy/02_deploy_survey_impl.ts --network sepolia
npx hardhat run deploy/03_deploy_survey_beacon.ts --network sepolia
npx hardhat run deploy/04_deploy_factory.ts --network sepolia
```

### 4. Verify Contracts

```bash
# Verify factory contract
npx hardhat verify --network sepolia FACTORY_ADDRESS

# Verify survey implementation
npx hardhat verify --network sepolia SURVEY_IMPL_ADDRESS

# Verify proxy admin
npx hardhat verify --network sepolia PROXY_ADMIN_ADDRESS
```

### 5. Current Deployed Addresses (Sepolia)

```javascript
// contracts/deployments/sepolia/addresses.json
{
  "ConfidentialSurvey_Implementation": "0x8B77D65b3eAf7B93b7AdAd0F7BfAe58D7DBa8d9B",
  "ConfidentialSurvey_Factory_Proxy": "0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214",
  "ProxyAdmin": "0x742d35Cc6634C0532925a3b8D3Ac89b12fD80fAE",
  "TransparentUpgradeableProxy": "0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214"
}
```

## 🎨 Frontend Deployment

### 1. Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
# Application Configuration
VITE_APP_NAME=FHEdback
VITE_APP_VERSION=1.0.0

# Contract Addresses (Sepolia)
VITE_FACTORY_ADDRESS=0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214
VITE_SURVEY_IMPL_ADDRESS=0x8B77D65b3eAf7B93b7AdAd0F7BfAe58D7DBa8d9B

# Network Configuration
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/your_project_id

# IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 2. Local Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Production Build

```bash
# Clean and build
npm run clean
npm run build

# Check build output
ls -la dist/

# Test production build locally
npm run preview
```

### 4. Deploy to Vercel

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_FACTORY_ADDRESS production
vercel env add VITE_PINATA_API_KEY production
# ... add all environment variables
```

#### Using GitHub Integration

1. Connect your repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### 5. Deploy to Netlify

#### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Using Git Integration

1. Connect repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. Add environment variables in Netlify dashboard

## 🔧 Custom Deployment Setup

### Docker Deployment

Create `Dockerfile` in frontend directory:

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Deploy with Docker:

```bash
# Build image
docker build -t fhedback-frontend .

# Run container
docker run -p 80:80 fhedback-frontend

# Or with docker-compose
docker-compose up -d
```

### Traditional VPS Deployment

```bash
# Connect to your server
ssh user@your-server.com

# Clone repository
git clone https://github.com/your-username/fhedback.git
cd fhedback/frontend

# Install dependencies
npm install

# Build project
npm run build

# Setup nginx
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/fhedback
sudo ln -s /etc/nginx/sites-available/fhedback /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🌐 Environment-Specific Configurations

### Development Environment

```env
# .env.development
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
VITE_API_BASE_URL=http://localhost:3000
VITE_CHAIN_ID=11155111  # Sepolia
```

### Staging Environment

```env
# .env.staging  
VITE_APP_ENV=staging
VITE_ENABLE_DEBUG=true
VITE_API_BASE_URL=https://staging-api.fhedback.com
VITE_CHAIN_ID=11155111  # Sepolia
```

### Production Environment

```env
# .env.production
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_API_BASE_URL=https://api.fhedback.com
VITE_CHAIN_ID=1  # Mainnet (when ready)
```

## 🔒 Security Considerations

### Environment Variables

- **Never commit** `.env` files to version control
- Use different keys for each environment
- Rotate API keys regularly
- Use encrypted storage for production secrets

### Smart Contract Security

- **Audit contracts** before mainnet deployment
- Use **multi-sig wallets** for admin operations
- Implement **pause mechanisms** for emergency stops
- **Monitor contract** interactions

### Frontend Security

- **Validate all inputs** on client and contract level
- **Sanitize user data** before display
- Use **HTTPS** in production
- Implement **CSP headers** for XSS protection

## 📊 Monitoring & Analytics

### Contract Monitoring

```bash
# Monitor contract events
npx hardhat run scripts/monitor.ts --network sepolia

# Check contract balances
npx hardhat run scripts/check-balances.ts --network sepolia
```

### Frontend Analytics

Add to your deployment:

```javascript
// Analytics setup (example with Google Analytics)
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App() {
  return (
    <>
      <main>Your App</main>
      <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
    </>
  )
}
```

### Error Tracking

```javascript
// Sentry setup for error tracking
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.VITE_APP_ENV
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy FHEdback

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd contracts && npm install
      - name: Run tests
        run: cd contracts && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
      - name: Build
        run: cd frontend && npm run build

  deploy:
    needs: [test-contracts, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build frontend
        run: cd frontend && npm install && npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🐛 Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check gas prices
npx hardhat run scripts/check-gas.ts --network sepolia

# Verify account balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Network Connection Issues
```bash
# Test RPC connection
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Performance Optimization

1. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

2. **Image Optimization**
   - Use WebP format for images
   - Implement lazy loading
   - Compress assets

3. **Code Splitting**
   ```typescript
   // Route-based code splitting
   const LazyComponent = lazy(() => import('./Component'))
   ```

---

This deployment guide covers all aspects of deploying FHEdback from development to production. Follow the steps carefully and adapt configurations to your specific needs.
