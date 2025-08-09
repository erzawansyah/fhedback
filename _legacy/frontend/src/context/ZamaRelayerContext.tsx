'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { ethers } from 'ethers';

type Ctx = {
    signer?: ethers.Signer;
    provider?: ethers.BrowserProvider;
    instance?: Awaited<ReturnType<typeof createInstance>>;
};

const FhevmContext = createContext<Ctx>({});

export const useFhevm = () => useContext(FhevmContext);

export function FhevmProvider({ children }: { children: React.ReactNode }) {
    const [ctx, setCtx] = useState<Ctx>({});

    useEffect(() => {
        (async () => {
            // 1.  Connect Metamask
            await (window).ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider((window).ethereum);
            const signer = await provider.getSigner();

            // 2.  Init Relayer SDK
            const instance = await createInstance(SepoliaConfig);

            setCtx({ signer, provider, instance });
        })();
    }, []);

    return <FhevmContext.Provider value={ctx}>{children}</FhevmContext.Provider>;
}
