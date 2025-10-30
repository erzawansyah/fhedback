// Layout Components
import PageLayout from "@/components/layout/PageLayout"
import PageTitle from "@/components/layout/PageTitle"

import { createFileRoute } from "@tanstack/react-router"
import { FileTextIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { transformToSurveyQuestions } from "@/utils/survey-transform"
import PlainBox from "@/components/layout/PlainBox"
import BasicSurveyCreation from "@/components/forms/survey-creation/BasicSurveyCreation"
import { useForm } from "react-hook-form"
import { makeDefaultValues, type FormIn, type FormOut } from "@/utils/survey-creation"
import { zodResolver } from "@hookform/resolvers/zod"
import { SurveySubmissionSchema } from "@/types/survey.schema"
import AdvancedSurveyCreation from "@/components/forms/survey-creation/AdvancedSurveyCreation"
import { useSurveyCreation } from "@/hooks/useSurveyCreation"
import { createDb } from "@/services/firebase/dbStore"
import { useAccount } from "wagmi"
import { logError, logSurvey, logTransaction, logPerformance } from "@/utils/logger"
import { getUserErrorMessage } from "@/utils/error-handling"

export const Route = createFileRoute('/app/creator/new/')({
    component: CreateSurveyPage,
})

/**
 * Survey creation page component
 * 
 * Features:
 * - Basic and advanced survey creation modes
 * - Form validation with Zod schema
 * - IPFS metadata and questions storage
 * - Smart contract integration for survey deployment
 */
function CreateSurveyPage() {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)
    const { address } = useAccount()
    const {
        createSurvey,
        receipt,
        isConfirmed,
        writeError,
        confirmError,
    } = useSurveyCreation()

    const form = useForm<FormIn>({
        /** IMPORTANT: resolver and generic both based on the same schema */
        resolver: zodResolver(SurveySubmissionSchema),
        mode: "onChange",
        defaultValues: { ...makeDefaultValues() },
    })

    const toggleAdvancedMode = () => {
        setIsAdvancedMode((prev) => !prev)
    }

    /**
     * Handle survey submission with proper error handling and user feedback
     */
    const submitHandler = async (values: FormOut) => {
        if (!address) {
            const error = new Error("Please connect your wallet to continue")
            logError("Survey creation failed", error, { component: 'CreateSurveyPage', function: 'submitHandler' })
            form.setError("root", {
                type: "manual",
                message: getUserErrorMessage(error)
            })
            return
        }

        const startTime = Date.now()

        try {
            // Step 1: Save metadata to IPFS
            const metadataCid = await createDb("metadata", values.metadata, address)

            // Step 2: Transform and save questions to IPFS
            const surveyQuestions = transformToSurveyQuestions(
                values.questions,
                values.metadata.title
            )

            const questionsCid = await createDb("questions", surveyQuestions, address)

            // Step 3: Create survey contract
            const totalQuestions = surveyQuestions.totalQuestions
            createSurvey({
                metadataCID: metadataCid,
                questionsCID: questionsCid,
                totalQuestions,
                owner: address as `0x${string}`,
                respondentLimit: values.respondentLimit,
                symbol: values.symbol
            })

            // Log successful initiation
            logSurvey.created(undefined, {
                component: 'CreateSurveyPage',
                symbol: values.symbol,
                questionsCount: totalQuestions
            })

        } catch (error) {
            const errorMessage = getUserErrorMessage(error)
            logError("Survey creation failed", error, {
                component: 'CreateSurveyPage',
                function: 'submitHandler',
                address
            })
            form.setError("root", {
                type: "manual",
                message: errorMessage
            })
        } finally {
            logPerformance("survey_creation_attempt", startTime, {
                component: 'CreateSurveyPage'
            })
        }
    }

    // Handle successful survey creation
    useEffect(() => {
        if (isConfirmed && receipt) {
            logTransaction.confirmed(receipt.transactionHash, {
                component: 'CreateSurveyPage',
                action: 'survey_creation'
            })
            logSurvey.created(receipt.transactionHash, {
                component: 'CreateSurveyPage'
            })
            form.reset()
        }
    }, [isConfirmed, receipt, form])

    // Handle transaction errors
    useEffect(() => {
        if (writeError || confirmError) {
            const error = writeError || confirmError
            const errorMessage = getUserErrorMessage(error)

            logError("Transaction failed", error, {
                component: 'CreateSurveyPage',
                type: writeError ? 'write_error' : 'confirm_error'
            })

            form.setError("root", {
                type: "manual",
                message: errorMessage
            })
        }
    }, [writeError, confirmError, form])


    return (
        <PageLayout>
            <PageTitle
                title="Create New Survey"
                description="Design your confidential survey with custom questions and settings."
                titleIcon={<FileTextIcon />}
                hideAction
            />
            <PlainBox className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Advanced Mode</h2>
                    <p className="text-sm text-muted-foreground">
                        Enable advanced features for survey creation.
                    </p>
                </div>
                <Switch checked={isAdvancedMode} onCheckedChange={toggleAdvancedMode} />
            </PlainBox>

            {isAdvancedMode ? (
                <AdvancedSurveyCreation />
            ) : (
                <BasicSurveyCreation
                    form={form}
                    handleSubmit={submitHandler}
                />
            )}
        </PageLayout>
    )
}
