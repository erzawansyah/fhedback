#!/bin/bash

echo "=== Setup Environment Variables untuk Sepolia Deployment ==="

echo "Script ini akan membantu Anda mengatur environment variables yang diperlukan untuk deployment ke Sepolia."
echo "Pastikan Anda sudah memiliki:"
echo "1. Mnemonic phrase (12 kata)"
echo "2. Infura API Key"
echo "3. Etherscan API Key"
echo ""

# Setup MNEMONIC
echo "1. Setup MNEMONIC (12 kata seed phrase)"
echo "Contoh: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
read -p "Masukkan mnemonic phrase Anda: " mnemonic
npx hardhat vars set MNEMONIC "$mnemonic"

# Setup INFURA_API_KEY
echo ""
echo "2. Setup INFURA_API_KEY"
echo "Dapatkan dari: https://infura.io/"
read -p "Masukkan Infura API Key: " infura_key
npx hardhat vars set INFURA_API_KEY "$infura_key"

# Setup ETHERSCAN_API_KEY
echo ""
echo "3. Setup ETHERSCAN_API_KEY"
echo "Dapatkan dari: https://etherscan.io/apis"
read -p "Masukkan Etherscan API Key: " etherscan_key
npx hardhat vars set ETHERSCAN_API_KEY "$etherscan_key"

echo ""
echo "✅ Environment variables berhasil di-setup!"
echo ""
echo "Untuk melihat variables yang sudah di-set, jalankan:"
echo "npx hardhat vars get MNEMONIC"
echo "npx hardhat vars get INFURA_API_KEY"
echo "npx hardhat vars get ETHERSCAN_API_KEY"
echo ""
echo "Untuk deployment ke Sepolia, jalankan:"
echo "npm run deploy:sepolia"
