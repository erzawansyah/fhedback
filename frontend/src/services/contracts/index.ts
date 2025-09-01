/**
 * FHEdback Smart Contract Integration
 * 
 * Updated: September 1, 2025
 * Status: ✅ Sepolia contracts deployed and verified (Direct Implementation)
 * Network: Sepolia Testnet (Chain ID: 11155111)
 * 
 * Note: Uses direct survey creation without beacon proxy pattern
 */

import survey_abi from "@/services/contracts/abis/ConfidentialSurvey.json"
import factory_abi from "@/services/contracts/abis/ConfidentialSurvey_Factory.json"

// ✅ VERIFIED CONTRACT ADDRESSES - Sepolia Testnet (Direct Implementation)
export const FACTORY_IMPLEMENTATION_ADDRESS = "0x95a37bc1148a2Dba364865926863f06B828e5FE4"
export const PROXY_ADMIN_ADDRESS = "0x8b7bcBCee9de4134e553365499f206698A9fB434"

// 🎯 MAIN CONTRACT ADDRESS FOR FRONTEND INTEGRATION
export const FACTORY_ADDRESS = "0xeD772f032bB500F55ed715781CcABff4625Cc5C8" // Factory Proxy

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
