# Setup Environment Variables untuk Sepolia Deployment (Windows PowerShell)

Write-Host "=== Setup Environment Variables untuk Sepolia Deployment ===" -ForegroundColor Cyan

Write-Host "Script ini akan membantu Anda mengatur environment variables yang diperlukan untuk deployment ke Sepolia." -ForegroundColor Yellow
Write-Host "Pastikan Anda sudah memiliki:" -ForegroundColor Yellow
Write-Host "1. Mnemonic phrase (12 kata)" -ForegroundColor White
Write-Host "2. Infura API Key" -ForegroundColor White
Write-Host "3. Etherscan API Key" -ForegroundColor White
Write-Host ""

# Setup MNEMONIC
Write-Host "1. Setup MNEMONIC (12 kata seed phrase)" -ForegroundColor Green
Write-Host "Contoh: word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12" -ForegroundColor Gray
$mnemonic = Read-Host "Masukkan mnemonic phrase Anda"
npx hardhat vars set MNEMONIC "$mnemonic"

# Setup INFURA_API_KEY
Write-Host ""
Write-Host "2. Setup INFURA_API_KEY" -ForegroundColor Green
Write-Host "Dapatkan dari: https://infura.io/" -ForegroundColor Gray
$infura_key = Read-Host "Masukkan Infura API Key"
npx hardhat vars set INFURA_API_KEY "$infura_key"

# Setup ETHERSCAN_API_KEY
Write-Host ""
Write-Host "3. Setup ETHERSCAN_API_KEY" -ForegroundColor Green
Write-Host "Dapatkan dari: https://etherscan.io/apis" -ForegroundColor Gray
$etherscan_key = Read-Host "Masukkan Etherscan API Key"
npx hardhat vars set ETHERSCAN_API_KEY "$etherscan_key"

Write-Host ""
Write-Host "✅ Environment variables berhasil di-setup!" -ForegroundColor Green
Write-Host ""
Write-Host "Untuk melihat variables yang sudah di-set, jalankan:" -ForegroundColor Yellow
Write-Host "npx hardhat vars get MNEMONIC" -ForegroundColor White
Write-Host "npx hardhat vars get INFURA_API_KEY" -ForegroundColor White
Write-Host "npx hardhat vars get ETHERSCAN_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Untuk deployment ke Sepolia, jalankan:" -ForegroundColor Yellow
Write-Host "npm run deploy:sepolia" -ForegroundColor White
