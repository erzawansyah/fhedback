"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { surveyQuestionsSchema, SurveyQuestionsType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { HelpCircle, Wallet, Loader, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

interface SurveyQuestionsFormProps {
    disabled: boolean
    status: SurveyCreationStatus
    onSubmit: (data: SurveyQuestionsType) => void
}

export const SurveyQuestionsForm: React.FC<SurveyQuestionsFormProps> = ({
    disabled,
    status,
    onSubmit
}) => {
    const { config, questions } = useSurveyCreationContext()

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
            toast.error("At least one question is required")
        }
    }

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

    // Show questions summary if already submitted
    if (questions && questions.length > 0 && status === "success") {
        return (
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
        )
    }

    return (
        <>
            <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">
                    Add {config?.totalQuestions || NaN} questions for your survey. Each question will use a 1-{config?.limitScale} rating scale.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Important:</strong> Questions can only be submitted once. After submission, both questions and metadata cannot be modified.
                    </p>
                </div>
            </div>

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
        </>
    )
}
