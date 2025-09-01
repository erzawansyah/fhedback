/**
 * FHEdback Smart Contract Integration
 * 
 * Updated: September 1, 2025
 * Status: ✅ Sepolia contracts deployed and verified
 * Network: Sepolia Testnet (Chain ID: 11155111)
 */

import survey_abi from "@/services/contracts/abis/ConfidentialSurvey.json"
import factory_abi from "@/services/contracts/abis/ConfidentialSurvey_Factory.json"

// ✅ VERIFIED CONTRACT ADDRESSES - Sepolia Testnet
export const SURVEY_IMPLEMENTATION_ADDRESS = "0xb213a72EfF95D042112a13Ea749094a7624F7e6A"
export const FACTORY_IMPLEMENTATION_ADDRESS = "0xe6EB51400def6B97C5cadb1984f701F3996152f0"
export const BEACON_ADDRESS = "0xc08F37e971a3c752c77702bf63f78bbFc2C9Bf5F"
export const PROXY_ADMIN_ADDRESS = "0x8b7bcBCee9de4134e553365499f206698A9fB434"

// 🎯 MAIN CONTRACT ADDRESS FOR FRONTEND INTEGRATION
export const FACTORY_ADDRESS = "0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214" // Factory Proxy

// Contract ABIs (updated from deployment)
export const ABIS = {
    survey: survey_abi,
    factory: factory_abi
}

// Network configuration
export const NETWORK_CONFIG = {
    chainId: 11155111, // Sepolia
    name: "Sepolia Testnet",
    blockExplorer: "https://eth-sepolia.blockscout.com",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY" // Replace with your key
}

// Helper functions
export function getFactoryContract() {
    return {
        address: FACTORY_ADDRESS,
        abi: factory_abi
    }
}

export function getSurveyABI() {
    return survey_abi
}
