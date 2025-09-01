/**
 * FHEdback Smart Contract Addresses
 * 
 * Updated: September 1, 2025
 * Network: Sepolia Testnet (Chain ID: 11155111)
 * Status: ✅ All contracts deployed and verified on Blockscout
 */

export const SEPOLIA_ADDRESSES = {
  // 🎯 Main contract for frontend integration
  FACTORY_PROXY: "0xF5E5cdC25f7f5B7Cfd3F2d33819d4D5eA1Dc2214", // Use this address
  
  // 📋 Other contract addresses (for reference)
  SURVEY_IMPLEMENTATION: "0xb213a72EfF95D042112a13Ea749094a7624F7e6A",
  BEACON: "0xc08F37e971a3c752c77702bf63f78bbFc2C9Bf5F",
  FACTORY_IMPLEMENTATION: "0xe6EB51400def6B97C5cadb1984f701F3996152f0",
  PROXY_ADMIN: "0x8b7bcBCee9de4134e553365499f206698A9fB434",
} as const;

export const MAINNET_ADDRESSES = {
  // 🚧 TODO: Update when deployed to mainnet
  FACTORY_PROXY: "0x0000000000000000000000000000000000000000",
  SURVEY_IMPLEMENTATION: "0x0000000000000000000000000000000000000000",
  BEACON: "0x0000000000000000000000000000000000000000",
  FACTORY_IMPLEMENTATION: "0x0000000000000000000000000000000000000000",
  PROXY_ADMIN: "0x0000000000000000000000000000000000000000",
} as const;

export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://eth-sepolia.blockscout.com",
    addresses: SEPOLIA_ADDRESSES,
  },
  MAINNET: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://etherscan.io",
    addresses: MAINNET_ADDRESSES,
  },
} as const;

/**
 * Get contract addresses for the current network
 * @param chainId - The chain ID of the network
 * @returns Contract addresses for the network
 */
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 11155111: // Sepolia
      return SEPOLIA_ADDRESSES;
    case 1: // Mainnet
      return MAINNET_ADDRESSES;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

/**
 * Get network info for the current chain
 * @param chainId - The chain ID of the network
 * @returns Network configuration
 */
export function getNetworkInfo(chainId: number) {
  switch (chainId) {
    case 11155111:
      return SUPPORTED_CHAINS.SEPOLIA;
    case 1:
      return SUPPORTED_CHAINS.MAINNET;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export default {
  SEPOLIA_ADDRESSES,
  MAINNET_ADDRESSES,
  SUPPORTED_CHAINS,
  getContractAddresses,
  getNetworkInfo,
};
