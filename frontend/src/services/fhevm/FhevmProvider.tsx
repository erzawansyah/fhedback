import React, { type ReactNode } from 'react';
import { usePublicClient } from 'wagmi';
import { useFhevm } from '@/fhevm-react/useFhevm';
import { FhevmContext } from './useFhevmContext';


interface FhevmProviderProps {
  children: ReactNode;
}

/**
 * Global FHEVM Provider that initializes the FHEVM instance once at app level
 * and shares it across all components to avoid multiple SDK loads
 */
export const FhevmProvider: React.FC<FhevmProviderProps> = ({ children }) => {
  const publicClient = usePublicClient();

  // Initialize FHEVM instance globally - this will load the SDK only once
  const { instance, status, error, refresh } = useFhevm({
    provider: publicClient ? publicClient : undefined,
    chainId: publicClient?.chain?.id,
    enabled: true, // Always enabled at app level
  });

  // Log initialization progress for debugging
  React.useEffect(() => {
    if (error) {
      console.error('[FhevmProvider] FHEVM Error:', error);
    }
    if (instance) {
      console.log('[FhevmProvider] FHEVM Instance initialized:', instance);
    }
  }, [status, error, instance]);

  return (
    <FhevmContext.Provider value={{ instance, status, error, refresh }}>
      {children}
    </FhevmContext.Provider>
  );
};
