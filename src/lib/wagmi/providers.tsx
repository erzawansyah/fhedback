"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/config";

export const queryClient = new QueryClient();

const Web3Provider = ({ children }: {
    children: React.ReactNode;
}) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={{
                        appName: "Fhedback",
                        learnMoreUrl: "https://github.com/erzawansyah/fhedback",
                    }}
                    initialChain={wagmiConfig.chains[0]}
                    modalSize="compact"
                    showRecentTransactions={true}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider >
    );
}

export default Web3Provider;
