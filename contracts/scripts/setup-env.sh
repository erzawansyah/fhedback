#!/bin/bash

echo "=== Setup Environment Variables for Sepolia Deployment ==="

echo "This script will help you configure the required environment variables for Sepolia deployment."
echo "Make sure you have:"
echo "1. Mnemonic phrase (12 words)"
echo "2. Infura API Key"
echo "3. Etherscan API Key"
echo ""

# Setup MNEMONIC
echo "1. Setup MNEMONIC (12-word seed phrase)"
echo "Example: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
read -p "Enter your mnemonic phrase: " mnemonic
npx hardhat vars set MNEMONIC "$mnemonic"

# Setup INFURA_API_KEY
echo ""
echo "2. Setup INFURA_API_KEY"
echo "Get from: https://infura.io/"
read -p "Enter your Infura API Key: " infura_key
npx hardhat vars set INFURA_API_KEY "$infura_key"

# Setup ETHERSCAN_API_KEY
echo ""
echo "3. Setup ETHERSCAN_API_KEY"
echo "Get from: https://etherscan.io/apis"
read -p "Enter your Etherscan API Key: " etherscan_key
npx hardhat vars set ETHERSCAN_API_KEY "$etherscan_key"

echo ""
echo "✅ Environment variables successfully configured!"
echo ""
echo "To view the configured variables, run:"
echo "npx hardhat vars get MNEMONIC"
echo "npx hardhat vars get INFURA_API_KEY"
echo "npx hardhat vars get ETHERSCAN_API_KEY"
echo ""
echo "To deploy to Sepolia, run:"
echo "npm run deploy:sepolia"
