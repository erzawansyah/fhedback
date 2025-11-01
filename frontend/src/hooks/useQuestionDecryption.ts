import { useState, useMemo, useCallback, useEffect } from 'react'
import type { Address } from 'viem'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { useFheDecryption } from '../services/fhevm/useFhevmContext'
import { ABIS } from '../services/contracts'
import type {
    EncryptedQuestionStats,
    DecryptedQuestionStats
} from '../types/survey-stats'
import {
    parseDecryptedDescriptive,
    parseDecryptedFrequencies
} from '../utils/stats-calculations'
import { grantAccess as grant, checkAccess } from '../services/firebase/acl'

const surveyAbi = ABIS.survey

/**
 * Hook to manage question statistics decryption flow
 */
export function useQuestionDecryption(
    contractAddress: Address | undefined,
    questionIndex: number,
    stats: EncryptedQuestionStats | null
) {
    const [isGranted, setIsGranted] = useState(false)
    const [isDecrypted, setIsDecrypted] = useState(false)
    const [decryptedData, setDecryptedData] = useState<DecryptedQuestionStats | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const account = useAccount()
    const { userDecrypt } = useFheDecryption()
    const { writeContractAsync, data: txHash } = useWriteContract()
    const { isSuccess: isTxConfirmed, isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: txHash !== undefined
        }
    })

    // Prepare encrypted handles
    const descriptiveHandles = useMemo(
        () => stats ? [stats.totalScore, stats.sumSquares, stats.minScore, stats.maxScore] : [],
        [stats]
    )

    const frequencyHandles = useMemo(
        () => stats ? Object.values(stats.questionFrequencies) : [],
        [stats]
    )

    // Grant decryption access
    const grantAccess = useCallback(async (to: "owner" | "respondent" = "owner") => {
        if (!contractAddress || !account.address) {
            throw new Error('Contract address or account not available')
        }
        const funcName = to === "owner" ? 'grantOwnerDecrypt' : 'grantRespondentDecrypt'
        
        setIsProcessing(true)
        try {
            await writeContractAsync({
                address: contractAddress,
                abi: surveyAbi,
                functionName: funcName,
                args: [questionIndex],
            })
            
            toast.success('Transaction sent. Waiting for confirmation...')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            toast.error(`Failed to grant decryption access: ${errorMessage}`)
            setIsProcessing(false)
            throw err
        }
    }, [contractAddress, questionIndex, writeContractAsync, account.address])

    // Main decryption handler - only decrypts, does NOT grant
    const handleDecrypt = useCallback(async () => {
        if (!stats || !contractAddress) return
        if (!isGranted) {
            toast.error('Please grant access first')
            return
        }

        setIsProcessing(true)
        try {
            // Decrypt descriptive stats and frequencies
            const decryptedDescriptive = await userDecrypt(descriptiveHandles, contractAddress)
            const decryptedFrequencies = await userDecrypt(frequencyHandles, contractAddress)

  

            // Parse results
            const parsedDescriptive = parseDecryptedDescriptive(
                decryptedDescriptive ?? null,
                descriptiveHandles
            )

            const parsedFrequencies = parseDecryptedFrequencies(
                decryptedFrequencies ?? null,
                frequencyHandles
            )

   

            const payload: DecryptedQuestionStats = {
                descriptive: parsedDescriptive,
                frequencies: parsedFrequencies
            }

            setDecryptedData(payload)
            setIsDecrypted(true)
            toast.success('Responses decrypted')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            toast.error(`Failed to decrypt responses: ${errorMessage}`)
            console.error('Error decrypting responses:', err)
        } finally {
            setIsProcessing(false)
        }
    }, [
        stats,
        contractAddress,
        userDecrypt,
        descriptiveHandles,
        frequencyHandles,
        isGranted
    ])

    // Check initial access status on mount
    useEffect(() => {
        const check = async () => {
            if (!contractAddress || !account.address) return
            const hasAccess = await checkAccess(
                contractAddress,
                account.address,
                questionIndex
            )
            setIsGranted(hasAccess)
        }
        check()
    }, [contractAddress, account.address, questionIndex])

    // Update ACL and state when transaction is confirmed
    useEffect(() => {
        const updateAfterConfirmation = async () => {
            if (isTxConfirmed && contractAddress && account.address) {

                await grant(contractAddress, account.address, questionIndex)
                setIsGranted(true)
                setIsProcessing(false)
                toast.success('Access granted! You can now decrypt.')
            }
        }
        updateAfterConfirmation()
    }, [isTxConfirmed, contractAddress, account.address, questionIndex])

    return {
        isDecrypted,
        decryptedData,
        isProcessing,
        isGranted,
        isWaitingForTx,
        handleDecrypt,
        grantAccess,
    }
}
