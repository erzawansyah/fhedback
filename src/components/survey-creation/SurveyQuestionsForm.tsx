"use client"

import { useEffect } from "react"
import { useForm, useFieldArray, Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { surveyQuestionsSchema, SurveyQuestionsType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { HelpCircle, Wallet, Loader, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/shadcn/utils"
import { toast } from "sonner"
import {
    FormSection,
    StatusAlert,
    StatusBadge
} from "./shared"

// Modular Question Item Component
interface QuestionItemProps {
    index: number
    control: Control<SurveyQuestionsType>
    disabled: boolean
    canRemove: boolean
    onRemove: () => void
}

const QuestionItem: React.FC<QuestionItemProps> = ({
    index,
    control,
    disabled,
    canRemove,
    onRemove
}) => (
    <div className={cn(
        "flex gap-3 p-4 rounded-base border-2 border-border bg-background",
        "hover:bg-secondary-background/50 transition-colors"
    )}>
        <div className="flex-shrink-0">
            <Badge variant="neutral" className="font-mono text-xs">
                Q{index + 1}
            </Badge>
        </div>
        <div className="flex-1">
            <FormField
                control={control}
                name={`questions.${index}.text`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground font-mono">
                            Question {index + 1} *
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder={`Enter question ${index + 1}...`}
                                disabled={disabled}
                                className={cn(
                                    "bg-secondary-background border-2 border-border rounded-base",
                                    "text-foreground font-mono",
                                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border"
                                )}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage className="text-danger font-mono text-xs" />
                    </FormItem>
                )}
            />
        </div>
        {canRemove && (
            <div className="flex-shrink-0">
                <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onRemove}
                    disabled={disabled}
                    className="mt-8"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        )}
    </div>
)

// Questions Summary Component
interface QuestionsSummaryProps {
    questions: string[]
}

const QuestionsSummary: React.FC<QuestionsSummaryProps> = ({ questions }) => (
    <div className="space-y-4">
        <StatusAlert
            type="success"
            title="Questions Submitted Successfully!"
            description={`Your survey now has ${questions.length} questions and is ready for final configuration.`}
        />

        <FormSection
            title="Your Questions"
            description="Review the questions that have been added to your survey"
        >
            <div className="space-y-3">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={cn(
                            "p-3 rounded-base bg-secondary-background border-2 border-border",
                            "flex items-start gap-3"
                        )}
                    >
                        <Badge variant="neutral" className="font-mono text-xs flex-shrink-0">
                            Q{index + 1}
                        </Badge>
                        <span className="text-sm font-mono text-foreground">{question}</span>
                    </div>
                ))}
            </div>
        </FormSection>
    </div>
)

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
        const maxQuestions = config?.totalQuestions || 20
        if (fields.length < maxQuestions) {
            append({ text: "" })
        } else {
            toast.error(`Maximum ${maxQuestions} questions allowed`)
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
        return <QuestionsSummary questions={questions} />
    }

    return (
        <>
            {/* Instructions Section */}
            <FormSection
                title={`Survey Questions (${fields.length}/${config?.totalQuestions || 'NaN'})`}
                description={`Add ${config?.totalQuestions || 'NaN'} questions for your survey. Each question will use a 1-${config?.limitScale} rating scale.`}
            >
                <StatusAlert
                    type="warning"
                    title="Important Notice"
                    description="Questions can only be submitted once. After submission, both questions and metadata cannot be modified."
                />
            </FormSection>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Questions List */}
                    <FormSection title="Questions">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <QuestionItem
                                    key={field.id}
                                    index={index}
                                    control={form.control}
                                    disabled={disabled}
                                    canRemove={fields.length > 1}
                                    onRemove={() => removeQuestion(index)}
                                />
                            ))}
                        </div>
                    </FormSection>

                    {/* Add Question Button */}
                    {fields.length < (config?.totalQuestions || 20) && (
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="neutral"
                                onClick={addQuestion}
                                disabled={disabled}
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Question ({fields.length}/{config?.totalQuestions || 20})
                            </Button>
                        </div>
                    )}

                    {/* Progress Indicator */}
                    <div className={cn(
                        "p-4 rounded-base bg-secondary-background border-2 border-border",
                        "flex items-center justify-between"
                    )}>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-main" />
                            <span className="text-sm font-mono text-foreground">Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge
                                status={fields.length === (config?.totalQuestions || 0) ? 'success' : 'pending'}
                            >
                                {`${fields.length}/${config?.totalQuestions || 0} questions`}
                            </StatusBadge>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            variant="default"
                            disabled={disabled || fields.length !== (config?.totalQuestions || 0)}
                            className="flex items-center gap-2"
                        >
                            {status === "loading" ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Wallet className="w-4 h-4" />
                            )}
                            {status === "loading" ? "Submitting Questions..." :
                                status === "signing" ? "Signing..." :
                                    status === "verifying" ? "Verifying..." :
                                        status === "error" ? "Error Submitting Questions" :
                                            "Submit Questions"
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}
