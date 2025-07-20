"use client"

import { useState } from "react"
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export type QuestionType = "text" | "textarea" | "single_choice" | "multiple_choice" | "rating" | "yes_no"

export interface Question {
    id: string
    type: QuestionType
    question: string
    required: boolean
    options: string[]
    minRating?: number
    maxRating?: number
}

interface QuestionsStepProps {
    onComplete: (questions: Question[]) => void
    onBack: () => void
    totalQuestions: number
    limitScale: number
    initialQuestions?: Question[]
    isLoading?: boolean
}

export const QuestionsStep = ({
    onComplete,
    onBack,
    totalQuestions,
    limitScale,
    initialQuestions = [],
    isLoading = false
}: QuestionsStepProps) => {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions)

    const addQuestion = () => {
        if (questions.length >= totalQuestions) {
            alert(`Maximum ${totalQuestions} questions allowed`)
            return
        }

        const newQuestion: Question = {
            id: `question_${Date.now()}`,
            type: "text",
            question: "",
            required: true,
            options: [],
            minRating: 1,
            maxRating: limitScale,
        }
        setQuestions([...questions, newQuestion])
    }

    const updateQuestion = (id: string, field: keyof Question, value: string | number | boolean | string[]) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ))
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const addOption = (questionId: string) => {
        setQuestions(questions.map(q =>
            q.id === questionId ? { ...q, options: [...q.options, ""] } : q
        ))
    }

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
                : q
        ))
    }

    const removeOption = (questionId: string, optionIndex: number) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
                : q
        ))
    }

    // Future feature: drag and drop reordering
    // const moveQuestion = (fromIndex: number, toIndex: number) => {
    //   const updatedQuestions = [...questions]
    //   const [movedQuestion] = updatedQuestions.splice(fromIndex, 1)
    //   updatedQuestions.splice(toIndex, 0, movedQuestion)
    //   setQuestions(updatedQuestions)
    // }

    const handleComplete = () => {
        // Validate questions
        const invalidQuestions = questions.filter(q =>
            !q.question.trim() ||
            (["single_choice", "multiple_choice"].includes(q.type) && q.options.filter(opt => opt.trim()).length < 2)
        )

        if (invalidQuestions.length > 0) {
            alert("Please complete all questions and ensure choice questions have at least 2 options")
            return
        }

        onComplete(questions)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Step 3: Add Questions
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Create up to {totalQuestions} questions for your survey ({questions.length}/{totalQuestions})
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={addQuestion}
                    variant="default"
                    disabled={questions.length >= totalQuestions || isLoading}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Button>
            </CardHeader>
            <CardContent>
                {questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg mb-2">No questions yet</p>
                        <p className="text-sm">Click &quot;Add Question&quot; to get started</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <Card key={question.id} className="border-dashed border-2">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                            <h4 className="font-medium">Question {index + 1}</h4>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => removeQuestion(question.id)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Question Type</Label>
                                                <Select
                                                    value={question.type}
                                                    onValueChange={(value: QuestionType) => updateQuestion(question.id, "type", value)}
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Short Text</SelectItem>
                                                        <SelectItem value="textarea">Long Text</SelectItem>
                                                        <SelectItem value="single_choice">Single Choice</SelectItem>
                                                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                        <SelectItem value="rating">Rating Scale (1-{limitScale})</SelectItem>
                                                        <SelectItem value="yes_no">Yes/No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2 self-end">
                                                <Checkbox
                                                    id={`required-${question.id}`}
                                                    checked={question.required}
                                                    onCheckedChange={(checked) => updateQuestion(question.id, "required", checked)}
                                                    disabled={isLoading}
                                                />
                                                <Label htmlFor={`required-${question.id}`}>Required</Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Question Text *</Label>
                                            <Textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                                                placeholder="Enter your question here..."
                                                disabled={isLoading}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Options for choice questions */}
                                        {(question.type === "single_choice" || question.type === "multiple_choice") && (
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <Label>Answer Options *</Label>
                                                    <Button
                                                        type="button"
                                                        variant="neutral"
                                                        size="sm"
                                                        onClick={() => addOption(question.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Option
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex gap-2">
                                                            <div className="flex-1 relative">
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                                                    {optionIndex + 1}.
                                                                </span>
                                                                <Input
                                                                    value={option}
                                                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                                                    placeholder={`Option ${optionIndex + 1}`}
                                                                    className="pl-8"
                                                                    disabled={isLoading}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="neutral"
                                                                size="sm"
                                                                onClick={() => removeOption(question.id, optionIndex)}
                                                                disabled={question.options.length <= 2 || isLoading}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {question.options.length < 2 && (
                                                        <p className="text-sm text-red-500">At least 2 options are required</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rating scale info */}
                                        {question.type === "rating" && (
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-sm text-gray-600">
                                                    This will be a rating scale from 1 to {limitScale}
                                                </p>
                                            </div>
                                        )}

                                        {/* Yes/No info */}
                                        {question.type === "yes_no" && (
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-sm text-gray-600">
                                                    This will be a simple Yes/No question
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <Button
                        type="button"
                        variant="neutral"
                        onClick={onBack}
                        disabled={isLoading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button
                        onClick={handleComplete}
                        disabled={questions.length === 0 || isLoading}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isLoading ? "Saving..." : "Complete Survey"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
