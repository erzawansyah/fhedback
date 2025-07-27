"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { HelpCircle, Wallet, Loader, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { submitQuestions } from "@/lib/utils/submitQuestions"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { surveyQuestionsSchema, SurveyQuestionsType } from "./formSchema"
import { useSurveySteps } from "@/hooks/use-survey-creation"



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


    // Form setup with React Hook Form
    const form = useForm<SurveyQuestionsType>({
        resolver: zodResolver(surveyQuestionsSchema),
        defaultValues: {
            questions: questions && questions.length > 0
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
    const disabled = steps.step3 || status === "loading" || status === "signing" || status === "verifying"


    /**
     * Add a new question field
     */
    const addQuestion = () => {
        if (fields.length < (config?.totalQuestions || 20)) {
            append({ text: "" })
        } else {
            toast.error(`Maximum ${config?.totalQuestions || 20} questions allowed`)
        }
    }

    /**
     * Remove a question field
     */
    const removeQuestion = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        } else {
            handleError("At least one question is required")
        }
    }

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
            console.log("Questions already submitted, setting status to success")
            handleStatus("success")
        }
    }, [questions, steps.step3, handleStatus, status])

    /**
     * Effect to sync form with context questions when they change
     */
    useEffect(() => {
        console.log("Syncing form with existing questions:", questions)
        if (questions && questions.length > 0) {
            form.reset({
                questions: questions.map(q => ({ text: q }))
            })
        }
    }, [questions, form])

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

    // Show questions summary if already submitted
    if (questions && questions.length > 0 && status === "success") {
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
                        Add {config?.totalQuestions || NaN} questions for your survey. Each question will use a 1-{config?.limitScale} rating scale.
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
                                                            disabled={disabled}
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
                                            disabled={disabled}
                                            className="mt-8"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Question Button */}
                        {fields.length < (config?.totalQuestions || 20) && (
                            <Button
                                type="button"
                                variant="neutral"
                                onClick={addQuestion}
                                disabled={disabled}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question ({fields.length}/{config?.totalQuestions})
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
                                    disabled={disabled || fields.length !== config?.totalQuestions}
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
                        {fields.length !== config?.totalQuestions && (
                            <p className="text-sm text-orange-600 text-center">
                                You need exactly {config?.totalQuestions} questions. Current: {fields.length}
                            </p>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
