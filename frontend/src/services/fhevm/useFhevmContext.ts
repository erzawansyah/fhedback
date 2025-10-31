import { useContext, createContext } from "react";
import { type FhevmGoState } from '@/fhevm-react/useFhevm';
import type { FhevmInstance } from '@/fhevm-react/fhevmTypes';
import { useAccount, useSignTypedData } from "wagmi";

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

  const userDecrypt = async (encryptedResponse: string[], contractAddress: string | `0x${string}` | `Address`) => {
    try {
      if (!encryptedResponse || !Array.isArray(encryptedResponse) || encryptedResponse.length === 0) 
        throw new Error("No encrypted responses provided");
      if (!fhe || status !== 'ready') {
        throw new Error("FHEVM not ready for decryption");
      }

      // simulate decryption process
      const keypair = fhe.generateKeypair()
      const handleContractPair = (encryptedResponse as string[]).map((ciphertext) => {
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
      console.log('Error revealing responses:', error)
    }
  }

  return {userDecrypt};
}
