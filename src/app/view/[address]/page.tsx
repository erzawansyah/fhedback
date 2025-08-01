"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LikertScale } from "@/components/survey-view"
import PageTitle from "@/components/layout/page-title"
import SurveySidebar from "./sidebar"
import { useSurveySubmission } from "@/hooks"
import { Address } from "viem"
import { EncryptedStatusCard } from "@/components/survey-view/EncryptedStatusCard"
import { signAndVerify } from "@/lib/utils/signMessage"
import { toast } from "sonner"

interface SurveyResponse {
    questionIndex: number
    rating: number | null
}

const SurveySubmissionPage = () => {
    const params = useParams()
    const router = useRouter()
    const address = params.address as Address

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [responses, setResponses] = useState<SurveyResponse[]>([])

    // Use the custom hook to fetch survey data
    const { surveyData, isLoading, error } = useSurveySubmission(address)



    useEffect(() => {
        if (surveyData) {
            // Initialize responses array when survey data is loaded
            const initialResponses: SurveyResponse[] = surveyData.questions.map((_, index) => ({
                questionIndex: index,
                rating: null
            }))
            setResponses(initialResponses)
        }
    }, [surveyData])

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
        setIsSubmitting(true)
        const { isVerified } = await signAndVerify(address)
        if (!isVerified) {
            toast.error("Signature verification failed. Please try again.")
            setIsSubmitting(false)
            return
        }

        // Prepare the responses for submission
        



        console.log("Submitting survey responses:", responses)
        await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate network delay
        setIsSubmitting(false)
    }

    if (isLoading) {
        return (
            <div className="min-h-dvh flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="text-gray-600 text-lg">Loading survey...</p>
                </div>
            </div>
        )
    }

    if (error.length > 0) {
        return (
            <>
                {error.map((err, index) => (
                    <p className="bg-danger p-2 mb-3" key={index}>{err}</p>
                ))}
            </>
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
                    <EncryptedStatusCard address={address} />
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
                        address={address}
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
