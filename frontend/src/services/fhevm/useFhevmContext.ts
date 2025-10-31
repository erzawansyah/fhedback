import { useContext, createContext } from "react";
import { type FhevmGoState } from '@/fhevm-react/useFhevm';
import type { FhevmInstance } from '@/fhevm-react/fhevmTypes';

interface FhevmContextValue {
  instance: FhevmInstance | undefined;
  status: FhevmGoState;
  error: Error | undefined;
  refresh: () => void;
}

export const FhevmContext = createContext<FhevmContextValue | undefined>(undefined);

export const useFhevmContext = () => {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevmContext must be used within FhevmProvider');
  }
  return context;
};
