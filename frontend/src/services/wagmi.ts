import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wagmiConfig = getDefaultConfig({
    appName: "FHEdback Confidential Survey",
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID!,
    chains: [sepolia],
    ssr: false, // Ubah ke false agar tidak error saat SSR
});
