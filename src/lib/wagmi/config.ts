import { sepolia } from "wagmi/chains";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
export const config = getDefaultConfig({
  appName: "FHE Survey Platform",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: false, // Ubah ke false agar tidak error saat SSR
});
