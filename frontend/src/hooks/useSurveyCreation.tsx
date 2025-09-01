import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABIS as abis, FACTORY_ADDRESS as address, type CreateSurveyParams } from "../services/contracts";
import { useEffect, useState } from "react";

const factoryAbi = abis.factory;
const factoryAddress = address;

/**
 * Custom hook for creating confidential surveys
 * 
 * Handles the complete survey creation flow including:
 * - Transaction submission to factory contract
 * - Transaction confirmation waiting
 * - Error handling and status tracking
 * 
 * @returns Object with survey creation functions and transaction status
 */
export const useSurveyCreation = () => {
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    // Hook for writing to the smart contract
    const {
        data: hash,
        isPending,
        isError,
        writeContract,
        error: writeError
    } = useWriteContract();

    // Hook for waiting for transaction confirmation
    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Update txHash when transaction is submitted
    useEffect(() => {
        if (hash) {
            setTxHash(hash);
        }
    }, [hash]);

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
        });
    };

    /**
     * Reset the hook state for a new survey creation
     */
    const reset = () => {
        setTxHash(undefined);
    };

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
        writeError,          // Error from contract write operation
        confirmError,        // Error from transaction confirmation
        
        // Actions
        createSurvey,        // Function to create a new survey
        reset                // Function to reset hook state
    };
}
