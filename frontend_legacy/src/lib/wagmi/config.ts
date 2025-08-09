import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Configure chains and providers
// Default RainbowKit/Wagmi client configuration
export const config = getDefaultConfig({
  appName: "FHE Survey Platform",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: false, // disable SSR to avoid hydration issues
});

// The previous setup has been removed to revert to the working configuration.
