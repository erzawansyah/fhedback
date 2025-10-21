import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { ABIS as abis, FACTORY_ADDRESS as address, type CreateSurveyParams } from "../services/contracts"
import { useEffect, useState } from "react"
import { parseError, logError, type AppError } from "../utils/error-handling"

const factoryAbi = abis.factory
const factoryAddress = address

/**
 * Custom hook for creating confidential surveys
 * 
 * Handles the complete survey creation flow including:
 * - Transaction submission to factory contract
 * - Transaction confirmation waiting
 * - Structured error handling and status tracking
 * 
 * @returns Object with survey creation functions and transaction status
 */
export const useSurveyCreation = () => {
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
    const [parsedError, setParsedError] = useState<AppError | null>(null)

    // Hook for writing to the smart contract
    const {
        data: hash,
        isPending,
        isError,
        writeContract,
        error: writeError,
        reset: resetWrite
    } = useWriteContract()

    // Hook for waiting for transaction confirmation
    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError
    } = useWaitForTransactionReceipt({
        hash: txHash,
    })

    // Update txHash when transaction is submitted
    useEffect(() => {
        if (hash) {
            setTxHash(hash)
            setParsedError(null) // Clear previous errors
        }
    }, [hash])

    // Handle write errors
    useEffect(() => {
        if (writeError) {
            const error = parseError(writeError)
            setParsedError(error)
            logError(writeError, 'useSurveyCreation - writeContract')
        }
    }, [writeError])

    // Handle confirmation errors
    useEffect(() => {
        if (confirmError) {
            const error = parseError(confirmError)
            setParsedError(error)
            logError(confirmError, 'useSurveyCreation - transaction confirmation')
        }
    }, [confirmError])

    /**
     * Create a new confidential survey
     * 
     * @param surveyData - Survey creation parameters
     * @param surveyData.owner - Address of the survey creator
     * @param surveyData.symbol - Short symbol for the survey (max 10 chars)
     * @param surveyData.metadataCID - IPFS CID for survey metadata
     * @param surveyData.questionsCID - IPFS CID for survey questions
     * @param surveyData.totalQuestions - Number of questions in the survey
     * @param surveyData.respondentLimit - Maximum number of respondents (1-1000)
     */
    const createSurvey = (surveyData: CreateSurveyParams) => {
        // Validate parameters before submission
        if (!surveyData.owner) {
            const error = parseError(new Error("Owner address is required"))
            setParsedError(error)
            logError(error, 'useSurveyCreation - validation')
            return
        }

        if (!surveyData.symbol || surveyData.symbol.length > 10) {
            const error = parseError(new Error("Symbol must be provided and no longer than 10 characters"))
            setParsedError(error)
            logError(error, 'useSurveyCreation - validation')
            return
        }

        if (!surveyData.metadataCID || !surveyData.questionsCID) {
            const error = parseError(new Error("Metadata and questions CIDs are required"))
            setParsedError(error)
            logError(error, 'useSurveyCreation - validation')
            return
        }

        if (surveyData.totalQuestions <= 0 || surveyData.totalQuestions > 50) {
            const error = parseError(new Error("Total questions must be between 1 and 50"))
            setParsedError(error)
            logError(error, 'useSurveyCreation - validation')
            return
        }

        if (surveyData.respondentLimit <= 0 || surveyData.respondentLimit > 1000) {
            const error = parseError(new Error("Respondent limit must be between 1 and 1000"))
            setParsedError(error)
            logError(error, 'useSurveyCreation - validation')
            return
        }

        // Clear previous errors and proceed with transaction
        setParsedError(null)

        writeContract({
            address: factoryAddress,
            abi: factoryAbi,
            functionName: "createSurvey",
            args: [
                surveyData.owner,
                surveyData.symbol,
                surveyData.metadataCID,
                surveyData.questionsCID,
                BigInt(surveyData.totalQuestions),
                BigInt(surveyData.respondentLimit)
            ],
        })
    }

    /**
     * Reset the hook state for a new survey creation
     */
    const reset = () => {
        setTxHash(undefined)
        setParsedError(null)
        resetWrite()
    }

    return {
        // Transaction identifiers
        hash: txHash,
        receipt,

        // Transaction status
        isPending,           // Transaction is being submitted
        isError,             // Error occurred during submission
        isConfirming,        // Waiting for block confirmation
        isConfirmed,         // Transaction confirmed on blockchain

        // Error details
        writeError,          // Raw error from contract write operation
        confirmError,        // Raw error from transaction confirmation
        error: parsedError,  // Parsed and structured error

        // Actions
        createSurvey,        // Function to create a new survey
        reset                // Function to reset hook state
    }
}
