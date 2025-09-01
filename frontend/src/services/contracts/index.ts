/**
 * FHEdback Smart Contract Integration
 * 
 * This module provides the configuration and interfaces for interacting with
 * the FHEdback confidential survey smart contracts deployed on Sepolia testnet.
 * 
 * Architecture:
 * - Factory Pattern: Central factory creates individual survey contracts
 * - Proxy Pattern: Upgradeable contracts using OpenZeppelin proxies
 * - FHE Integration: Fully Homomorphic Encryption for confidential surveys
 * 
 * Updated: September 1, 2025
 * Status: ✅ Sepolia contracts deployed and verified
 * Network: Sepolia Testnet (Chain ID: 11155111)
 */

import survey_abi from "@/services/contracts/abis/ConfidentialSurvey.json"
import factory_abi from "@/services/contracts/abis/ConfidentialSurvey_Factory.json"

// ✅ VERIFIED CONTRACT ADDRESSES - Sepolia Testnet
// All contracts are verified on Sepolia Blockscout and ready for production use

/** Factory Implementation Contract - Contains the factory logic */
export const FACTORY_IMPLEMENTATION_ADDRESS = "0x95a37bc1148a2Dba364865926863f06B828e5FE4"

/** Proxy Admin Contract - Manages upgrades for the proxy system */
export const PROXY_ADMIN_ADDRESS = "0x8b7bcBCee9de4134e553365499f206698A9fB434"

/** 
 * 🎯 MAIN CONTRACT ADDRESS FOR FRONTEND INTEGRATION
 * 
 * This is the Factory Proxy address that the frontend should interact with.
 * It provides a stable interface while allowing for upgrades to the underlying logic.
 */
export const FACTORY_ADDRESS = "0xeD772f032bB500F55ed715781CcABff4625Cc5C8" // Factory Proxy

/**
 * Contract ABIs for TypeScript integration
 * These ABIs are generated from the compiled Solidity contracts
 */
export const ABIS = {
    survey: survey_abi,      // Individual survey contract ABI
    factory: factory_abi     // Survey factory contract ABI
} as const

/**
 * Network configuration for Sepolia testnet
 */
export const NETWORK_CONFIG = {
    chainId: 11155111,
    name: "Sepolia Testnet", 
    blockExplorer: "https://eth-sepolia.blockscout.com",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Replace with your Infura key
    currency: {
        name: "Sepolia ETH",
        symbol: "ETH",
        decimals: 18
    }
} as const

/**
 * Helper function to get factory contract configuration
 * @returns Factory contract address and ABI for use with wagmi/viem
 */
export function getFactoryContract() {
    return {
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: factory_abi
    } as const
}

/**
 * Helper function to get survey contract ABI
 * @returns Survey contract ABI for use with dynamically created survey contracts
 */
export function getSurveyABI() {
    return survey_abi
}

/**
 * Helper function to validate if an address is a valid Ethereum address
 * @param address - Address to validate
 * @returns boolean indicating if address is valid
 */
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Type definitions for better TypeScript support
 */
export type ContractAddress = `0x${string}`
export type SurveyStatus = 0 | 1 | 2 | 3 // Created | Active | Closed | Trashed

/**
 * Survey creation parameters type for type safety
 */
export interface CreateSurveyParams {
    owner: ContractAddress
    symbol: string
    metadataCID: string
    questionsCID: string
    totalQuestions: number
    respondentLimit: number
}
