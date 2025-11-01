import { useContext, createContext } from "react";
import { type FhevmGoState } from '@/fhevm-react/useFhevm';
import type { FhevmInstance } from '@/fhevm-react/fhevmTypes';
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "sonner";

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

export const useFheDecryption = () => {
  const { instance: fhe, status } = useFhevmContext();
  const { signTypedDataAsync } = useSignTypedData();
  const account = useAccount();

  const publicDecrypt = async (handles: string[]) => {
    try {
      if (!handles || !Array.isArray(handles) || handles.length === 0) 
        throw new Error("No encrypted responses provided");
      if (!fhe || status !== 'ready') {
        throw new Error("FHEVM not ready for decryption");
      }
      const result = await fhe.publicDecrypt(handles);
      return result
    } catch (error) {
      toast.error('Failed to reveal responses: ' + String(error))
    }
  }

  const userDecrypt = async (handles: string[], contractAddress: string | `0x${string}` | `Address`) => {
    try {
      if (!handles || !Array.isArray(handles) || handles.length === 0) 
        throw new Error("No encrypted responses provided");
      if (!fhe || status !== 'ready') {
        throw new Error("FHEVM not ready for decryption");
      }

      // simulate decryption process
      const keypair = fhe.generateKeypair()
      const handleContractPair = (handles as string[]).map((ciphertext) => {
        return {
          handle: ciphertext,
          contractAddress: contractAddress,
        };
      });
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10'; // String for consistency
      const contractAddresses = [contractAddress];

      const eip712 = fhe.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays,
      );

      // Cast verifyingContract to the required template literal type (`0x${string}`) to satisfy typed-data domain typing.
      const domain = {
        ...eip712.domain,
        verifyingContract: eip712.domain.verifyingContract as unknown as `0x${string}`,
      };

      const signature = await signTypedDataAsync({
        domain,
        types: {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        primaryType: 'UserDecryptRequestVerification',
        message: eip712.message,
      });

      const result = await fhe.userDecrypt(
        handleContractPair,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        account.address as `0x${string}`,
        startTimeStamp,
        durationDays,
      );

      return result;
    } catch (error) {
      toast.error('Error revealing responses: ' + String(error));
    }
  }

  return {publicDecrypt, userDecrypt};
}
