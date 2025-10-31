import { useCallback, useState } from "react";
import { bytesToHex, type Abi, type Address } from "viem";
import { ABIS } from "../services/contracts";
import { useFhevmContext } from "../services/fhevm/useFhevmContext";
import { useReadContract, useSignTypedData, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type SurveyResponse = { [questionId: number]: number };
const surveyAbi = ABIS.survey as Abi;

export const useSurveySubmission = (addr: Address, account: Address) => {
  const [state, setState] = useState<'idle' | 'encrypting' | 'submitting' | 'submitted'>('idle')
  const [responses, setResponses] = useState<SurveyResponse>({})
  const [storedResponse, setStoredResponse] = useState<number[] | null>(null)
  const { instance: fhe, status: fheStatus } = useFhevmContext()
  const { writeContractAsync } = useWriteContract()
  const { data: encryptedResponse } = useReadContract({
    address: addr as Address,
    abi: surveyAbi,
    functionName: 'getRespondentResponses',
    args: [account],
  })
  const { signTypedDataAsync } = useSignTypedData()


  const encryptResponses = useCallback(async () => {
    if (!fhe || fheStatus !== 'ready') throw new Error("FHEVM not ready")
    const buffer = fhe.createEncryptedInput(addr, account)
    Object.values(responses).forEach(rating => buffer.add8(BigInt(rating)))
    return await buffer.encrypt()
  }, [fhe, fheStatus, addr, account, responses])
  const navigate = useNavigate();

  const handleRating = (qid: number, rating: number) => {
    setResponses((prev) => ({ ...prev, [qid]: rating }))
  }

  const handleSubmit = () => {
    setState('encrypting')
    setTimeout(() => {
      _handleSubmit()
    }, 100)
  }

  const _handleSubmit = async () => {
    try {
      console.log("Encrypting survey responses...")
      const ciphertexts = await encryptResponses()
      console.log('Encrypted survey data:', ciphertexts)

      const payload = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: ciphertexts.handles.map((handle: any) => bytesToHex(handle)),
        inputProof: bytesToHex(ciphertexts.inputProof),
      }

      setState('submitting')
      console.log("Submitting survey responses to the blockchain...")
      const tx = await writeContractAsync({
        address: addr as Address,
        abi: surveyAbi,
        functionName: 'submitResponses',
        args: [payload.responses, payload.inputProof],
      })

      if (tx) {
        toast.success('Survey submitted successfully!', {
          description: 'Your responses have been submitted to the blockchain. Waiting for confirmation...',
          action: {
            label: 'View TX',
            onClick: () => { window.open(`https://eth-sepolia.blockscout.com/tx/${tx}`, '_blank') }
          }
        })
        setState('submitted')
        setTimeout(() => {
          navigate({
            to: `/surveys/explore`,
          })
        }, 3000)
      } else {
        throw new Error('Transaction failed')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error('Failed to encrypt: ' + err.message)
      console.log('Error during survey submission:', err)
      setState('idle')
    }
  }

  const resetResponses = () => {
    setResponses({})
    setState('idle')
  }

  const closeSurvey = async (onSuccess?: () => void, onError?: () => void) => {
    try {
      const tx = await writeContractAsync({
        address: addr as Address,
        abi: surveyAbi,
        functionName: 'closeSurvey',
      })
      if (tx) {
        toast.success('Survey closed successfully!', {
          description: 'The survey has been closed on the blockchain.',
          action: {
            label: 'View TX',
            onClick: () => { window.open(`https://eth-sepolia.blockscout.com/tx/${tx}`, '_blank') }
          }
        })
        onSuccess?.()
      }
    } catch (err) {
      toast.error('Failed to close survey: ' + String(err))
      console.log('Error closing survey:', err)
      onError?.()
    }
  }

  const revealResponses = async () => {
    try {
      if (!encryptedResponse) return
      if (!fhe || fheStatus !== 'ready') {
        toast.error('FHEVM not ready for decryption')
        return
      }

      // simulate decryption process
      const keypair = fhe.generateKeypair()
      const handleContractPair = (encryptedResponse as string[]).map((ciphertext) => {
        return {
          handle: ciphertext,
          contractAddress: addr as string,
        };
      });
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10'; // String for consistency
      const contractAddresses = [addr];

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
        account,
        startTimeStamp,
        durationDays,
      );
      const decryptedValues = Object.keys(result).map((key) => Number(result[key]));
      setStoredResponse(decryptedValues);
    } catch (error) {
      toast.error('Failed to reveal responses: ' + String(error))
      console.log('Error revealing responses:', error)
    }
  }

  return {
    state,
    responses,
    storedResponse,
    handleRating,
    resetResponses,
    handleSubmit,
    closeSurvey,
    revealResponses,
  }
}
