"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { HelpCircle, Wallet, Loader, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { submitQuestions } from "@/lib/utils/submitQuestions"
import { sign } from "@/lib/utils/signMessage"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { useSurveyCreation } from "@/context/SurveyCreationContext"

/**
 * Zod schema for survey questions validation
 */
const surveyQuestionsSchema = z.object({
    questions: z.array(
        z.object({
            text: z.string().min(1, "Question cannot be empty").max(500, "Question must be less than 500 characters")
        })
    ).min(1, "At least one question is required").refine(
        (questions) => questions.length <= 20,
        { message: "Maximum 20 questions allowed" }
    )
})

export type SurveyQuestionsData = z.infer<typeof surveyQuestionsSchema>

type SubmissionStatus = "idle" | "loading" | "signing" | "verifying" | "success" | "error"

/**
 * SurveyQuestionsStep Component
 * Handles adding questions to the survey
 */
export const SurveyQuestionsStep = () => {
    const { config, metadata, questions, setQuestions, handleQuestionsAdded } = useSurveyCreation()
    const isFhe = config.isFhe || undefined;
    const account = useAccount()

    // State management
    const [status, setStatus] = useState<SubmissionStatus>("idle")
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

    // Monitor transaction status
    const { isSuccess, isError } = useWaitForTransactionReceipt({
        hash: txHash || undefined,
        query: {
            enabled: !!txHash,
        }
    })

    // Form setup with React Hook Form
    const form = useForm<SurveyQuestionsData>({
        resolver: zodResolver(surveyQuestionsSchema),
        defaultValues: {
            questions: questions.length > 0
                ? questions.map(q => ({ text: q }))
                : [{ text: "" }] // Start with existing questions or one empty question
        }
    })

    // Field array for dynamic questions
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "questions"
    })

    // Check if component should be editable
    const hasExistingQuestions = questions.length > 0 && config.questionsAdded
    const canEdit = config.status === "initialized" && config.address && metadata !== null && !hasExistingQuestions
    const isDisabled = status === "loading" || status === "signing" || status === "verifying" || !canEdit

    /**
     * Effect to sync form with context questions when they change
     */
    useEffect(() => {
        if (questions.length > 0) {
            form.reset({
                questions: questions.map(q => ({ text: q }))
            })
        }
    }, [questions, form])

    /**
     * Add a new question field
     */
    const addQuestion = () => {
        if (fields.length < (config.totalQuestions || 20)) {
            append({ text: "" })
        } else {
            toast.error(`Maximum ${config.totalQuestions || 20} questions allowed`)
        }
    }

    /**
     * Remove a question field
     */
    const removeQuestion = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        } else {
            toast.error("At least one question is required")
        }
    }

    /**
     * Handle form submission
     */
    const onSubmit = async (data: SurveyQuestionsData) => {
        console.log("is FHE:", isFhe)
        if (!account.address) {
            toast.error("Please connect your wallet to save questions.")
            return
        }

        if (!config.address) {
            toast.error("Survey contract address is not set.")
            return
        }

        if (isFhe === undefined) {
            toast.error("Survey privacy setting is not configured.")
            return
        }

        // Validate question count matches survey configuration
        if (data.questions.length !== config.totalQuestions) {
            toast.error(`You must add exactly ${config.totalQuestions} questions`)
            return
        }

        setStatus("signing")

        try {
            // Step 1: Get user signature for verification
            const { message, signature } = await sign(account.address as `0x${string}`)

            if (!signature) {
                throw new Error("Failed to get signature")
            }

            // Step 2: Prepare questions data
            setStatus("loading")
            const questionsData = {
                address: account.address as `0x${string}`,
                signature,
                message,
                isFhe,
                questions: data.questions.map(q => q.text)
            }

            // Step 3: Submit to blockchain
            const txHash = await submitQuestions(config.address as `0x${string}`, questionsData)

            if (txHash) {
                setTxHash(txHash)
                setStatus("verifying")
                toast.success("Transaction sent! Waiting for confirmation...")
            } else {
                throw new Error("Failed to get transaction hash")
            }

        } catch (error) {
            setStatus("error")
            toast.error(`Failed to save questions: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }

    /**
     * Handle transaction status changes
     */
    useEffect(() => {
        if (isSuccess && txHash) {
            setStatus("success")
            setTxHash(null)

            // Update context with submitted questions
            const currentQuestions = form.getValues("questions").map(q => q.text)
            setQuestions(currentQuestions)
            handleQuestionsAdded()

            toast.success("Questions saved successfully!")
        } else if (isError && txHash) {
            setStatus("error")
            setTxHash(null)
            toast.error("Transaction failed. Please try again.")
        }
    }, [isSuccess, isError, txHash, form, setQuestions, handleQuestionsAdded])

    // Don't render if survey is not initialized or conditions not met
    if (!config.address || config.status !== "initialized") {
        return null
    }



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

    // Show questions summary if already submitted
    if (hasExistingQuestions) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Step 3: Survey Questions
                        <span className="text-sm font-normal text-green-600">(Completed)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-sm text-green-800">
                                ✅ <strong>Questions submitted successfully!</strong> Your survey now has {questions.length} questions.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Your Questions:</h4>
                            <div className="space-y-1">
                                {questions.map((question, index) => (
                                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                        <span className="font-medium">Q{index + 1}:</span> {question}
                                    </div>
                                ))}
                            </div>
                        </div>
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
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Add {config.totalQuestions} questions for your survey. Each question will use a 1-{config.limitScale} rating scale.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Important:</strong> Questions can only be submitted once. After submission, both questions and metadata cannot be modified.
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Questions List */}
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <div className="flex-1">
                                        <FormField
                                            control={form.control}
                                            name={`questions.${index}.text`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question {index + 1}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={`Enter question ${index + 1}...`}
                                                            disabled={isDisabled}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => removeQuestion(index)}
                                            disabled={isDisabled}
                                            className="mt-8"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Question Button */}
                        {fields.length < (config.totalQuestions || 20) && (
                            <Button
                                type="button"
                                variant="neutral"
                                onClick={addQuestion}
                                disabled={isDisabled}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question ({fields.length}/{config.totalQuestions})
                            </Button>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            {status === "success" ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <HelpCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Questions submitted successfully!</span>
                                </div>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isDisabled || fields.length !== config.totalQuestions}
                                    className="flex items-center gap-2"
                                >
                                    {(status === "loading" || status === "signing" || status === "verifying") ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Wallet className="w-4 h-4" />
                                    )}
                                    {status === "loading" ? "Saving..." :
                                        status === "signing" ? "Signing..." :
                                            status === "verifying" ? "Verifying..." :
                                                "Save Questions"
                                    }
                                </Button>
                            )}
                        </div>

                        {/* Question Count Validation */}
                        {fields.length !== config.totalQuestions && (
                            <p className="text-sm text-orange-600 text-center">
                                You need exactly {config.totalQuestions} questions. Current: {fields.length}
                            </p>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
