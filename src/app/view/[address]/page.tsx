"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Clock, Users, Award, Shield, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface SurveyQuestion {
    id: string
    type: "text" | "multiple-choice" | "rating" | "boolean"
    question: string
    required: boolean
    options?: string[]
}

interface SurveyData {
    id: string
    title: string
    description: string
    category: string
    estimatedTime: number
    reward: number
    totalQuestions: number
    currentResponses: number
    maxResponses: number
    questions: SurveyQuestion[]
    creator: string
    isActive: boolean
}

interface SurveyResponse {
    questionId: string
    answer: string | string[]
}

const SurveyViewPage = () => {
    const params = useParams()
    const router = useRouter()
    const address = params.address as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [responses, setResponses] = useState<SurveyResponse[]>([])
    const [isCompleted, setIsCompleted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Mock function to fetch survey data from contract address
    const fetchSurveyData = async (contractAddress: string): Promise<SurveyData> => {
        // Simulate API call to blockchain/backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock survey data
                const mockSurvey: SurveyData = {
                    id: contractAddress,
                    title: "AI Technology Adoption in Workplace",
                    description: "Help us understand how AI is being adopted in modern workplaces and its impact on productivity.",
                    category: "Technology",
                    estimatedTime: 5,
                    reward: 25,
                    totalQuestions: 5,
                    currentResponses: 156,
                    maxResponses: 200,
                    creator: "0x1234...5678",
                    isActive: true,
                    questions: [
                        {
                            id: "q1",
                            type: "multiple-choice",
                            question: "What is your current role in your organization?",
                            required: true,
                            options: ["Manager", "Developer", "Designer", "Analyst", "Other"]
                        },
                        {
                            id: "q2",
                            type: "rating",
                            question: "How would you rate your experience with AI tools? (1-5)",
                            required: true,
                            options: ["1", "2", "3", "4", "5"]
                        },
                        {
                            id: "q3",
                            type: "multiple-choice",
                            question: "Which AI tools do you use regularly? (Select all that apply)",
                            required: false,
                            options: ["ChatGPT", "GitHub Copilot", "Midjourney", "Notion AI", "None"]
                        },
                        {
                            id: "q4",
                            type: "boolean",
                            question: "Do you believe AI will improve workplace productivity?",
                            required: true
                        },
                        {
                            id: "q5",
                            type: "text",
                            question: "What challenges do you see with AI adoption in your workplace?",
                            required: false
                        }
                    ]
                }

                // Simulate potential errors
                if (contractAddress === "invalid") {
                    reject(new Error("Survey not found"))
                } else {
                    resolve(mockSurvey)
                }
            }, 1000)
        })
    }

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                setIsLoading(true)
                const data = await fetchSurveyData(address)
                setSurveyData(data)

                // Initialize responses array
                const initialResponses: SurveyResponse[] = data.questions.map(q => ({
                    questionId: q.id,
                    answer: q.type === "multiple-choice" && q.question.includes("Select all") ? [] : ""
                }))
                setResponses(initialResponses)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load survey")
            } finally {
                setIsLoading(false)
            }
        }

        if (address) {
            loadSurvey()
        }
    }, [address])

    const updateResponse = (questionId: string, answer: string | string[]) => {
        setResponses(prev =>
            prev.map(r =>
                r.questionId === questionId ? { ...r, answer } : r
            )
        )
    }

    const getCurrentResponse = (questionId: string) => {
        return responses.find(r => r.questionId === questionId)?.answer || ""
    }

    const isCurrentQuestionAnswered = () => {
        if (!surveyData) return false
        const currentQuestion = surveyData.questions[currentQuestionIndex]
        const currentResponse = getCurrentResponse(currentQuestion.id)

        if (!currentQuestion.required) return true

        if (Array.isArray(currentResponse)) {
            return currentResponse.length > 0
        }
        return currentResponse.toString().trim() !== ""
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < surveyData!.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const submitSurvey = async () => {
        if (!surveyData) return

        setIsSubmitting(true)
        try {
            // Mock submission to blockchain/backend
            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log("Submitting survey responses:", {
                surveyAddress: address,
                responses: responses
            })

            setIsCompleted(true)
        } catch (error) {
            console.error("Survey submission error:", error)
            setError("Failed to submit survey. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderQuestion = (question: SurveyQuestion) => {
        const currentResponse = getCurrentResponse(question.id)

        switch (question.type) {
            case "text":
                return (
                    <div className="space-y-3">
                        <Label htmlFor={question.id}>{question.question}</Label>
                        <Input
                            id={question.id}
                            placeholder="Type your answer here..."
                            value={currentResponse as string}
                            onChange={(e) => updateResponse(question.id, e.target.value)}
                        />
                    </div>
                )

            case "multiple-choice":
                if (question.question.includes("Select all")) {
                    // Multi-select checkbox
                    const selectedOptions = currentResponse as string[]
                    return (
                        <div className="space-y-3">
                            <Label>{question.question}</Label>
                            <div className="space-y-2">
                                {question.options?.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${question.id}-${option}`}
                                            checked={selectedOptions.includes(option)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    updateResponse(question.id, [...selectedOptions, option])
                                                } else {
                                                    updateResponse(question.id, selectedOptions.filter(o => o !== option))
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                } else {
                    // Single select radio
                    return (
                        <div className="space-y-3">
                            <Label>{question.question}</Label>
                            <RadioGroup
                                value={currentResponse as string}
                                onValueChange={(value) => updateResponse(question.id, value)}
                            >
                                {question.options?.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )
                }

            case "rating":
                return (
                    <div className="space-y-3">
                        <Label>{question.question}</Label>
                        <RadioGroup
                            value={currentResponse as string}
                            onValueChange={(value) => updateResponse(question.id, value)}
                        >
                            <div className="flex space-x-4">
                                {question.options?.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>
                )

            case "boolean":
                return (
                    <div className="space-y-3">
                        <Label>{question.question}</Label>
                        <RadioGroup
                            value={currentResponse as string}
                            onValueChange={(value) => updateResponse(question.id, value)}
                        >
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id={`${question.id}-no`} />
                                    <Label htmlFor={`${question.id}-no`}>No</Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                )

            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (error || !surveyData) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Card>
                    <CardContent className="pt-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Not Found</h1>
                        <p className="text-gray-600 mb-6">
                            {error || "The survey you're looking for doesn't exist or has been removed."}
                        </p>
                        <Button onClick={() => router.push("/explore")}>
                            Browse Other Surveys
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <Card>
                    <CardContent className="pt-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-green-600 mb-4">Survey Completed!</h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for participating in this survey. Your responses have been securely recorded using FHE technology.
                        </p>
                        <div className="bg-green-50 p-4 rounded-lg mb-6">
                            <p className="text-green-700 font-semibold">
                                You&apos;ve earned {surveyData.reward} tokens for your participation!
                            </p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => router.push("/explore")}>
                                Take Another Survey
                            </Button>
                            <Button variant="neutral" onClick={() => router.push("/respondent")}>
                                View Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const currentQuestion = surveyData.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / surveyData.totalQuestions) * 100

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Survey Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <CardTitle className="text-2xl mb-2">{surveyData.title}</CardTitle>
                            <p className="text-gray-600">{surveyData.description}</p>
                        </div>
                        <Badge variant="neutral">{surveyData.category}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{surveyData.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span>{surveyData.reward} tokens</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{surveyData.currentResponses}/{surveyData.maxResponses}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span>FHE Protected</span>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Progress */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-500">
                            {currentQuestionIndex + 1} of {surveyData.totalQuestions}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Question */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Question {currentQuestionIndex + 1}
                        {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderQuestion(currentQuestion)}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="neutral"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                {currentQuestionIndex === surveyData.questions.length - 1 ? (
                    <Button
                        onClick={submitSurvey}
                        disabled={!isCurrentQuestionAnswered() || isSubmitting}
                        className="flex items-center gap-2"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Survey"}
                        <Award className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={nextQuestion}
                        disabled={!isCurrentQuestionAnswered()}
                        className="flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Required Field Notice */}
            <p className="text-xs text-gray-500 text-center mt-4">
                * Required fields must be completed to proceed
            </p>
        </div>
    )
}

export default SurveyViewPage
