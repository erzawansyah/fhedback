/**
 * FHEdback Smart Contract Integration
 * 
 * This module provides the configuration and interfaces for interacting with
 * the FHEdback confidential survey smart contracts deployed on Sepolia testnet.
 * 
 * Updated: October 30, 2025
 * Status: ✅ Sepolia contracts deployed and verified
 * Network: Sepolia Testnet (Chain ID: 11155111)
 */

import survey_abi from "@/services/contracts/abis/ConfidentialSurvey.json"
import factory_abi from "@/services/contracts/abis/ConfidentialSurvey_Factory.json"
import { isAddress, type Address } from "viem"

// ✅ VERIFIED CONTRACT ADDRESSES - Sepolia Testnet
// All contracts are verified on Sepolia Blockscout and ready for production use

/** 
 * 🎯 MAIN CONTRACT ADDRESS FOR FRONTEND INTEGRATION
 * 
 * This is the Factory Proxy address that the frontend should interact with.
 * It provides a stable interface while allowing for upgrades to the underlying logic.
 */
export const FACTORY_ADDRESS: Address = "0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15" as const

/**
 * Contract ABIs for TypeScript integration
 * These ABIs are generated from the compiled Solidity contracts
 */
export const ABIS = {
    survey: survey_abi,      // Individual survey contract ABI
    factory: factory_abi     // Survey factory contract ABI
} as const


/**
 * Helper function to get factory contract configuration
 * @returns Factory contract address and ABI for use with wagmi/viem
 */
export function getFactoryContract() {
    return {
        address: FACTORY_ADDRESS,
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
 * Format survey status for display
 * @param status - Numeric status from contract
 * @returns Human-readable status string
 */
export function formatSurveyStatus(status: SurveyStatus): string {
    const statusMap: Record<SurveyStatus, string> = {
        0: "Created",
        1: "Active", 
        2: "Closed",
        3: "Trashed"
    }
    return statusMap[status] || "Unknown"
}

/**
 * Get survey status color for UI
 * @param status - Numeric status from contract
 * @returns CSS color class
 */
export function getSurveyStatusColor(status: SurveyStatus): string {
    const colorMap: Record<SurveyStatus, string> = {
        0: "bg-yellow-100 text-yellow-800",
        1: "bg-green-100 text-green-800",
        2: "bg-blue-100 text-blue-800", 
        3: "bg-red-100 text-red-800"
    }
    return colorMap[status] || "bg-gray-100 text-gray-800"
}

/**
 * Check if a survey can be modified based on its status
 * @param status - Current survey status
 * @returns boolean indicating if survey can be modified
 */
export function canModifySurvey(status: SurveyStatus): boolean {
    return status === 0 // Only Created surveys can be modified
}

/**
 * Format contract address for display (shortened)
 * @param address - Full contract address
 * @param chars - Number of characters to show at start/end
 * @returns Formatted address string
 */
export function formatAddress(address: string, chars: number = 6): string {
    if (!address || !isAddress(address)) return ""
    if (address.length <= chars * 2) return address
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Type definitions for better TypeScript support
 */
export type SurveyStatus = 0 | 1 | 2 | 3 // Created | Active | Closed | Trashed

/**
 * Survey creation parameters type for type safety
 */
export interface CreateSurveyParams {
    owner: Address
    symbol: string
    metadataCID: string
    questionsCID: string
    totalQuestions: number
    respondentLimit: number
}
