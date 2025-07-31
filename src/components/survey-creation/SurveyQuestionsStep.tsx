"use client"

import { useEffect } from "react"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { SurveyQuestionsType } from "./formSchema"
import { SurveyQuestionsForm } from "./SurveyQuestionsForm"

import { HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { submitQuestions } from "@/lib/utils/submitQuestions"
import { useSurveySteps } from "@/hooks/useSurveyCreation"



/**
 * SurveyQuestionsStep Component
 * Handles adding questions to the survey
 */
export const SurveyQuestionsStep: React.FC = () => {
    const { steps, config, metadata, questions, setQuestionsStatus } = useSurveyCreationContext()
    const encrypted = config?.encrypted
    const contractAddress = config?.address

    // Use consistent state management hook like SurveySettingsStep
    const {
        status,
        receipt,
        account,
        handleError,
        handleStatus,
        handleTxHash,
        handleSign,
    } = useSurveySteps()

    // Check if component should be editable
    const disabled = steps.step3 || status === "loading" || status === "signing" || status === "verifying"

    /**
     * Handle form submission
     */
    const onSubmit = async (data: SurveyQuestionsType) => {
        if (encrypted === undefined || encrypted === null) {
            throw new Error("Survey encryption setting is not defined")
        }
        try {
            // Step 1: Sign and verify
            const { isVerified, signature, message } = await handleSign()
            if (!isVerified || !signature || !message) {
                throw new Error("Failed to verify account ownership")
            }

            // Step 2: Prepare data for submission
            const questionsData = {
                address: account.address as `0x${string}`,
                signature,
                message,
                encrypted,
                questions: data.questions.map(q => q.text)
            }

            // Step 3: Submit to blockchain
            if (!contractAddress) {
                throw new Error("Contract address is not defined")
            }
            const txHash = await submitQuestions(config.address as `0x${string}`, questionsData)

            if (txHash) {
                handleTxHash(txHash)
                toast.success("Transaction sent! Waiting for confirmation...")
            } else {
                throw new Error("Failed to get transaction hash")
            }

        } catch (error) {
            handleError(error instanceof Error ? error.message : "Unknown error")
        }
    }

    /**
     * Effect to handle if questions already exist
     */
    useEffect(() => {
        if (steps.step3 && status === "idle" && questions && questions.length > 0) {
            handleStatus("success")
        }
    }, [questions, steps.step3, handleStatus, status])

    /**
     * Handle transaction status changes
     */
    useEffect(() => {
        if (receipt && status === "success" && contractAddress) {
            setQuestionsStatus()
        }
    }, [receipt, status, contractAddress, setQuestionsStatus])

    // Show waiting message if metadata is not set
    if (!metadata) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Step 3: Survey Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-600">
                            Please complete Step 2 (Survey Metadata) before adding questions.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Step 3: Survey Questions
                    {status === "success" && (
                        <span className="text-sm font-normal text-green-600">(Completed)</span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <SurveyQuestionsForm
                    disabled={disabled}
                    status={status}
                    onSubmit={onSubmit}
                />
            </CardContent>
        </Card>
    )
}
