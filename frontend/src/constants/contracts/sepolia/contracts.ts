// Generated contract constants for sepolia (Chain ID: 11155111)
// Generated on: 2025-11-01T04:25:23.693Z
// DO NOT EDIT MANUALLY - This file is auto-generated

// Network Info
export const NETWORK_NAME = "sepolia" as const;
export const CHAIN_ID = 11155111 as const;

// Contract Addresses
export const CONFIDENTIALSURVEY_FACTORY_ADDRESS = "0x24405CcEE48dc76B34b7c80865e9c5CF2bEDCD15" as const;

// Contract ABIs
export { default as ConfidentialSurvey_FactoryABI } from './ConfidentialSurvey_Factory.abi.json';

// All addresses object
export const CONTRACT_ADDRESSES = {
  ConfidentialSurvey_Factory: CONFIDENTIALSURVEY_FACTORY_ADDRESS,
} as const;

// Contract info with ABIs
export const CONTRACT_INFO = {
  ConfidentialSurvey_Factory: {
    address: CONFIDENTIALSURVEY_FACTORY_ADDRESS,
    abi: ConfidentialSurvey_FactoryABI,
  },
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddress = typeof CONTRACT_ADDRESSES[ContractName];
