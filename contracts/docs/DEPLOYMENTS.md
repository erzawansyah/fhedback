# FHEdback Deployment Scripts

This directory contains deployment scripts for the FHEdback confidential survey system using Hardhat Deploy.

## 🎯 Quick Deployment Commands

### Deploy to Local Network (Hardhat)
```bash
# Deploy everything to local hardhat network
npm run deploy:local

# Or deploy step by step locally
npm run deploy:survey-impl:local
npm run deploy:survey-beacon:local
npm run deploy:factory:local
```

### Deploy to Sepolia Testnet
```bash
# Deploy everything to Sepolia
npm run deploy:sepolia

# Or deploy step by step to Sepolia
npm run deploy:survey-impl:sepolia
npm run deploy:survey-beacon:sepolia
npm run deploy:factory:sepolia
```

### Deploy to Default Network (from hardhat.config.ts)
```bash
# Deploy to default network (hardhat)
npm run deploy
```

## 🎯 What Do You Want To Do?

### If you want to **deploy everything from scratch**, do:
```bash
# Local deployment
npm run deploy:local

# Sepolia deployment  
npm run deploy:sepolia
```
This runs `01_deploy_all.ts` which deploys the complete system in one go.

### If you want to **deploy step by step** (for debugging or learning), do:
```bash
# Step 1: Deploy the survey contract template
npm run deploy:survey-impl:local       # for local
npm run deploy:survey-impl:sepolia     # for sepolia

# Step 2: Deploy the beacon that points to the template
npm run deploy:survey-beacon:local     # for local  
npm run deploy:survey-beacon:sepolia   # for sepolia  

# Step 3: Deploy the factory that creates surveys
npm run deploy:factory:local       # for local
npm run deploy:factory:sepolia     # for sepolia
```

## 🔄 Upgrade Commands

### If you want to **update the survey contract logic** (affects all existing surveys), do:
```bash
# Local upgrade
npm run upgrade:survey-impl:local

# Sepolia upgrade  
npm run upgrade:survey-impl:sepolia
```
This deploys a new survey implementation and updates the beacon.

### If you want to **update the factory contract logic** (keeps existing surveys unchanged), do:
```bash
# Local upgrade
npm run upgrade:factory-impl:local

# Sepolia upgrade
npm run upgrade:factory-impl:sepolia
```
This deploys a new factory implementation and updates the proxy.

## 🧪 Testing Commands

### If you want to **test on local network first**, do:
```bash
# Start local hardhat node (in one terminal)
npx hardhat node

# In another terminal, deploy to localhost
npm run deploy:local

# Or use specific localhost network
npx hardhat deploy --network localhost --tags All
```

### Direct Hardhat Commands (Alternative)
```bash
# Deploy to specific networks directly
npx hardhat deploy --network hardhat --tags All      # Local
npx hardhat deploy --network sepolia --tags All      # Sepolia
npx hardhat deploy --network localhost --tags All    # Local node
```

## 🔍 Verification Commands

### If you want to **verify contracts on Etherscan**, do:
```bash
# After deployment to Sepolia, verify each contract
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# For constructor arguments
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "arg1" "arg2"
```

## 📁 Script Details

| Script | Command | When to Use | What It Does |
|--------|---------|-------------|--------------|
| **Complete Deployment** |
| `01_deploy_all.ts` | `npm run deploy:local` <br> `npm run deploy:sepolia` | First deployment or clean start | Deploys everything: implementation → beacon → factory proxy |
| **Step-by-step Deployment** |
| `02_deploy_survey_impl.ts` | `npm run deploy:survey-impl:local` <br> `npm run deploy:survey-impl:sepolia` | Need just the survey template | Deploys ConfidentialSurvey implementation only |
| `03_deploy_survey_beacon.ts` | `npm run deploy:survey-beacon:local` <br> `npm run deploy:survey-beacon:sepolia` | Need the upgrade mechanism | Deploys beacon pointing to survey implementation |
| `04_deploy_factory.ts` | `npm run deploy:factory:local` <br> `npm run deploy:factory:sepolia` | Need the survey factory | Deploys factory implementation + proxy + admin |
| **Upgrade Scripts** |
| `05_upgrade_survey_impl.ts` | `npm run upgrade:survey-impl:local` <br> `npm run upgrade:survey-impl:sepolia` | Update survey logic | New implementation + beacon upgrade |
| `06_upgrade_factory_impl.ts` | `npm run upgrade:factory-impl:local` <br> `npm run upgrade:factory-impl:sepolia` | Update factory logic | New factory implementation + proxy upgrade |

## 📋 Deployment Flow

### Initial Deployment
```mermaid
graph TD
    A[Deploy ConfidentialSurvey Implementation] --> B[Deploy ConfidentialSurvey_Beacon]
    B --> C[Deploy ConfidentialSurvey_Factory Implementation]
    C --> D[Deploy ProxyAdmin]
    D --> E[Deploy TransparentUpgradeableProxy for Factory]
    E --> F[Initialize Factory with Beacon]
```

### Survey Creation Flow
```mermaid
graph TD
    A[Factory.createSurvey] --> B[Deploy BeaconProxy]
    B --> C[BeaconProxy → Beacon → Implementation]
    C --> D[Initialize Survey Instance]
```

## 🔧 Configuration Setup

### If you want to **deploy to a new network**, do:
1. Add network to `hardhat.config.ts`:
```typescript
networks: {
  yourNetwork: {
    url: "YOUR_RPC_URL",
    accounts: ["YOUR_PRIVATE_KEY"]
  }
}
```

2. Deploy using:
```bash
npm run deploy --network yourNetwork
```

### If you want to **use different deployer account**, do:
1. Update `namedAccounts` in `hardhat.config.ts`:
```typescript
namedAccounts: {
  deployer: {
    default: 1, // Use second account instead of first
    // or specific per network:
    mainnet: "0x1234...", // specific address
    sepolia: 2 // third account
  }
}
```

## � Common Problems & Solutions

### If you see **"Implementation not deployed"**, do:
```bash
# Deploy survey implementation first
npm run deploy:survey-impl
```

### If you see **"Beacon not found"**, do:
```bash
# Deploy beacon first
npm run deploy:survey-beacon
```

### If you see **"Factory not deployed"**, do:
```bash
# Deploy factory first  
npm run deploy:factory
```

### If you see **"Insufficient gas"**, do:
1. Check gas price:
```bash
# View current gas prices
npx hardhat console --network sepolia
> await ethers.provider.getGasPrice()
```

2. Increase gas limit in `hardhat.config.ts`:
```typescript
networks: {
  sepolia: {
    gas: 8000000, // Increase this
    gasPrice: 20000000000 // 20 gwei
  }
}
```

### If you want to **check what's deployed**, do:
```bash
# List deployment files
ls deployments/sepolia/

# Check specific contract
cat deployments/sepolia/ConfidentialSurvey.json | jq '.address'
```

### If you want to **interact with deployed contracts**, do:
```bash
# Open hardhat console
npx hardhat console --network sepolia

# Get factory instance
> const factory = await ethers.getContractAt("ConfidentialSurvey_Factory", "FACTORY_ADDRESS")

# Check factory status
> await factory.getBeacon()
> await factory.totalSurveys()

# Create a test survey
> await factory.createSurvey(
    "0x1234...", // owner
    "TEST01",    // symbol
    "QmHash123", // metadata
    "QmHash456", // questions
    5,           // scale
    100          // max respondents
  )
```

## ⚠️ Important Notes

### If you want to **upgrade survey logic**, remember:
- This affects **ALL existing surveys** immediately
- Test thoroughly on testnet first
- Consider backward compatibility

### If you want to **upgrade factory logic**, remember:
- This only affects **new surveys** created after upgrade
- Existing surveys keep using old implementation
- Much safer than survey upgrades

### If you want to **deploy to mainnet**, remember:
1. Test everything on testnet first
2. Use hardware wallet or multi-sig
3. Verify contracts on Etherscan
4. Monitor gas costs carefully
5. Consider timelock for upgrades

## 🧪 Testing & Verification

### If you want to **test deployments locally**, do:
```bash
# Start local node with pre-funded accounts
npx hardhat node

# Deploy to local network
npm run deploy --network localhost

# Run tests against deployed contracts
npm test -- --network localhost
```

### If you want to **verify deployment success**, do:
```bash
# Check all contracts deployed
npx hardhat run scripts/verify-deployment.ts --network sepolia

# Manual verification
npx hardhat console --network sepolia
> const addresses = require('./deployments/sepolia/.migrations.json')
> console.log(addresses)
```

### If you want to **monitor gas usage**, do:
```bash
# Enable gas reporting
REPORT_GAS=true npm run deploy

# Or check individual transactions
npx hardhat console --network sepolia
> const tx = await ethers.provider.getTransaction("TX_HASH")
> const receipt = await ethers.provider.getTransactionReceipt("TX_HASH")
> console.log(`Gas used: ${receipt.gasUsed}`)
```
