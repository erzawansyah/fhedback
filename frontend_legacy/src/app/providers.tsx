"use client";

import { Web3Providers } from "@/context/Web3Providers";
import { UIProvider } from "@/context/UIContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Web3Providers>
            <UIProvider>
                {children}
            </UIProvider>
        </Web3Providers>
    );
}
