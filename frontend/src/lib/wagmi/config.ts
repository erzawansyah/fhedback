// import { getDefaultConfig } from "@rainbow-me/rainbowkit";
// import { sepolia } from "viem/chains";
// export const wagmiConfig = getDefaultConfig({
//   appName: "FHEdback",
//   projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
//   chains: [sepolia],
//   ssr: true,
// });

import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    }),
    safe(),
  ],
  chains: [sepolia],
  ssr: true,
  transports: {
    [sepolia.id]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
    ), // Bisa tambahkan URL RPC custom jika perlu
  },
});
