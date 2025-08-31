import type { Address } from "viem"
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { ABIS } from "../services/contracts"
import { useEffect, useState } from "react"
import { getDb } from "../services/firebase/dbStore"
import type { SurveyQuestion } from "../types/survey.schema"
import type { DocumentData } from "firebase/firestore"

type SurveyStatus = number

// This hook implement update, delete and create survey transactions
export const useSurveyManager = (contractAddress: Address) => {
    const [ready, setReady] = useState(false);
    const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>();
    const [questionsCID, setQuestionsCID] = useState<string>();
    const [txHash, setTxHash] = useState<Address>();
    const contract = useWriteContract()
    const receipt = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash }
    })
    const { data } = useReadContract({
        address: contractAddress,
        abi: ABIS.survey,
        functionName: "survey",
        args: [],
        query: {
            enabled: !!contractAddress && !ready,
        }
    })

    useEffect(() => {
        if (Array.isArray(data) && data.length > 7) {
            setSurveyStatus(Number(data[7]));
            setQuestionsCID(data[3]);
            setReady(true);
        }
    }, [data])

    const publish = async () => {
        console.log(contractAddress)


        try {
            if (!ready || !contract || !questionsCID) return;

            // Available when status is "Created"
            if (surveyStatus !== 0) return;

            const questions: DocumentData | null = await getDb("questions", questionsCID);
            if (!questions) return;
            console.log(questions);
            const maxScores = (questions.content.questions as SurveyQuestion[]).map(question => {
                return question.response.maxScore;
            });
            if (maxScores.length === 0) return;
            const txHash = await contract.writeContractAsync({
                address: contractAddress,
                abi: ABIS.survey,
                functionName: "publishSurvey",
                args: [maxScores]
            });
            if (txHash) {
                setTxHash(txHash);
            }
        } catch (error) {
            console.error("Publish survey error:", error);
        }
    }
    return { isReady: ready, publish, contract, receipt, txHash }
}




