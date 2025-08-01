"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LikertScale, SurveyCompletion } from "@/components/survey-view"
import PageTitle from "@/components/layout/page-title"
import SurveySidebar from "./sidebar"

interface SurveyData {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    owner: string
    maxScale: number
    minLabel: string
    maxLabel: string
    questions: string[]
    estimatedTime: number
    reward: number
    currentResponses: number
    maxResponses: number
    isActive: boolean
}

interface SurveyResponse {
    questionIndex: number
    rating: number | null
}

const SurveySubmissionPage = () => {
    const params = useParams()
    const router = useRouter()
    const address = params.address as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [surveyData, setSurveyData] = useState<SurveyData | null>(null)
    const [responses, setResponses] = useState<SurveyResponse[]>([])
    const [isCompleted, setIsCompleted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Mock function to fetch survey data from contract address
    const fetchSurveyData = async (contractAddress: string): Promise<SurveyData> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const mockSurvey: SurveyData = {
                    id: contractAddress,
                    title: "Customer Satisfaction Survey",
                    description: "Help us improve our services by sharing your experience and feedback about our platform. Your responses will help us understand what works well and what needs improvement.",
                    category: "Business",
                    tags: ["customer service", "satisfaction", "feedback", "improvement", "UX"],
                    owner: "0x1234567890abcdef1234567890abcdef12345678",
                    maxScale: 10,
                    minLabel: "Strongly Disagree",
                    maxLabel: "Strongly Agree",
                    questions: [
                        "I find the platform easy to navigate and use",
                        "The user interface is intuitive and well-designed",
                        "The platform loads quickly and responds well",
                        "Customer support is helpful and responsive",
                        "I would recommend this platform to others",
                        "The features meet my needs effectively",
                        "The platform provides good value for money",
                        "I am satisfied with my overall experience"
                    ],
                    estimatedTime: 3,
                    reward: 15,
                    currentResponses: 45,
                    maxResponses: 100,
                    isActive: true
                }

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
                const initialResponses: SurveyResponse[] = data.questions.map((_, index) => ({
                    questionIndex: index,
                    rating: null
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

    const updateResponse = (questionIndex: number, rating: number) => {
        setResponses(prev =>
            prev.map(r =>
                r.questionIndex === questionIndex ? { ...r, rating } : r
            )
        )
    }

    const getCurrentResponse = (questionIndex: number) => {
        return responses.find(r => r.questionIndex === questionIndex)?.rating
    }

    const getCompletionPercentage = () => {
        if (!surveyData) return 0
        const answeredQuestions = responses.filter(r => r.rating !== null).length
        return Math.round((answeredQuestions / surveyData.questions.length) * 100)
    }

    const canSubmit = () => {
        if (!surveyData) return false
        // For now, all questions are required
        return responses.every(r => r.rating !== null)
    }

    const submitSurvey = async () => {
        console.log("Submitting survey responses:", responses)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        setIsSubmitting(false)
        setIsCompleted(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="text-gray-600 text-lg">Loading survey...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-red-600 text-center">Survey Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">{error}</p>
                        <Button onClick={() => router.push("/explore")} variant="neutral" className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Explore
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <SurveyCompletion
                reward={surveyData?.reward || 0}
                onContinue={() => router.push("/explore")}
            />
        )
    }

    if (!surveyData) return null

    return (
        <div>
            <PageTitle
                title={surveyData.title}
                description={surveyData.description}
                titleIcon={<FileText size={32} className="text-main" />}
                handleAction={() => router.push("/explore")}
                actionIcon={<ArrowLeft className="w-4 h-4" />}
                actionText="Back to Explore"
            />

            <div className="grid grid-cols-4 gap-6 min-h-92">
                <div className="col-span-4 lg:col-span-3 space-y-6">
                    {/* Questions Card */}
                    <Card className="bg-main">
                        <CardContent className="flex items-center justify-between text-xl">
                            Survey Questions
                            <Badge variant="neutral">{surveyData.questions.length} questions</Badge>
                        </CardContent>
                    </Card>

                    {surveyData.questions.map((question, index) => (
                        <div key={index}>
                            <LikertScale
                                questionId={`q${index}`}
                                question={question}
                                required={true}
                                scale={surveyData.maxScale}
                                minLabel={surveyData.minLabel}
                                maxLabel={surveyData.maxLabel}
                                value={getCurrentResponse(index) || null}
                                onChange={(rating) => updateResponse(index, rating)}
                                questionNumber={index + 1}
                            />
                        </div>
                    ))}
                </div>

                <div className="col-span-4 lg:col-span-1">
                    <SurveySidebar
                        surveyData={surveyData}
                        progress={getCompletionPercentage()}
                        canSubmit={canSubmit()}
                        onSubmit={submitSurvey}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    )
}

export default SurveySubmissionPage
