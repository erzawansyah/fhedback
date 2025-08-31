import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABIS as abis, FACTORY_ADDRESS as address } from "../services/contracts";
import type { Address } from "viem";
import { useEffect, useState } from "react";

const factoryAbi = abis.factory;
const factoryAddress = address;
type CreateSurveyParams = {
    owner: Address;
    symbol: string;
    metadataCID: string;
    questionsCID: string;
    totalQuestions: number;
    respondenLimit: number;
}

export const useSurveyCreation = () => {
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const {
        data: hash,
        isPending,
        isError,
        writeContract
    } = useWriteContract();

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
                BigInt(surveyData.respondenLimit)
            ],
        });
    };

    return {
        hash: txHash,
        receipt,
        isPending,
        isError,
        isConfirming,
        isConfirmed,
        confirmError,
        createSurvey
    };
}
