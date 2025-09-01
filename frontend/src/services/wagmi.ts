import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

/**
 * Wagmi configuration for FHEdback application
 * 
 * Configures Web3 connectivity with:
 * - Sepolia testnet for FHEVM compatibility
 * - RainbowKit for wallet connection UI
 * - Project-specific app metadata
 */
export const wagmiConfig = getDefaultConfig({
    appName: "FHEdback - Confidential Survey Platform",
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia],
    ssr: false, // Disable SSR for client-side rendering
});
