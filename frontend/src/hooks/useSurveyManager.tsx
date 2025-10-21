import type { Address } from "viem"
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { ABIS } from "../services/contracts"
import { useEffect, useState } from "react"
import { getDb } from "../services/firebase/dbStore"
import type { SurveyQuestion } from "../types/survey.schema"
import type { DocumentData } from "firebase/firestore"
import { logger } from "../utils/logger"
import { parseError } from "../utils/error-handling"
import { SURVEY_STATUS } from "../constants/app"

type SurveyStatus = number

/**
 * Hook for managing survey lifecycle operations (publish, update, delete)
 * Provides functionality to interact with survey contracts and manage survey state
 */
export const useSurveyManager = (contractAddress: Address) => {
    const [ready, setReady] = useState(false)
    const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>()
    const [questionsCID, setQuestionsCID] = useState<string>()
    const [txHash, setTxHash] = useState<Address>()
    const [error, setError] = useState<string | null>(null)

    const contract = useWriteContract()
    const receipt = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: !!txHash }
    })

    // Read survey data from contract
    const { data } = useReadContract({
        address: contractAddress,
        abi: ABIS.survey,
        functionName: "survey",
        args: [],
        query: {
            enabled: !!contractAddress && !ready,
        }
    })

    // Initialize survey data when contract data is available
    useEffect(() => {
        if (Array.isArray(data) && data.length > 7) {
            const status = Number(data[7])
            const cid = data[3]

            setSurveyStatus(status)
            setQuestionsCID(cid)
            setReady(true)

            logger.info('Survey data initialized', {
                contractAddress,
                status,
                questionsCID: cid
            })
        }
    }, [data, contractAddress])

    /**
     * Publish survey to blockchain (transition from Created to Published status)
     * Only available when survey status is "Created" (status = 0)
     */
    const publish = async (): Promise<boolean> => {
        try {
            setError(null)
            logger.info('Starting survey publish process', { contractAddress })

            // Validate prerequisites
            if (!ready || !contract || !questionsCID) {
                const errorMsg = 'Survey not ready for publishing'
                logger.error(errorMsg, {
                    ready,
                    hasContract: !!contract,
                    questionsCID
                })
                setError(errorMsg)
                return false
            }

            // Check if survey can be published (status must be Created = 0)
            if (surveyStatus !== SURVEY_STATUS.CREATED) {
                const errorMsg = `Survey cannot be published in current status: ${surveyStatus}`
                logger.warn(errorMsg, { surveyStatus, contractAddress })
                setError(errorMsg)
                return false
            }

            // Fetch questions from database
            const questions: DocumentData | null = await getDb("questions", questionsCID)
            if (!questions) {
                const errorMsg = 'Failed to fetch survey questions'
                logger.error(errorMsg, { questionsCID })
                setError(errorMsg)
                return false
            }

            // Extract max scores from questions
            const surveyQuestions = questions.content.questions as SurveyQuestion[]
            const maxScores = surveyQuestions.map(question => question.response.maxScore)

            if (maxScores.length === 0) {
                const errorMsg = 'No valid questions found for survey'
                logger.error(errorMsg, { questionsCount: surveyQuestions.length })
                setError(errorMsg)
                return false
            }

            logger.info('Publishing survey to blockchain', {
                contractAddress,
                questionsCount: maxScores.length,
                maxScores
            })

            // Execute publish transaction
            const hash = await contract.writeContractAsync({
                address: contractAddress,
                abi: ABIS.survey,
                functionName: "publishSurvey",
                args: [maxScores]
            })

            if (hash) {
                setTxHash(hash)
                logger.info('Survey publish transaction submitted', {
                    contractAddress,
                    txHash: hash
                })
                return true
            }

            return false
        } catch (error) {
            const parsedError = parseError(error)
            const errorMsg = `Failed to publish survey: ${parsedError.message}`

            logger.error('Survey publish failed', {
                contractAddress,
                error: parsedError,
                type: parsedError.type
            })

            setError(errorMsg)
            return false
        }
    }

    return {
        isReady: ready,
        surveyStatus,
        questionsCID,
        error,
        publish,
        contract,
        receipt,
        txHash
    }
}




