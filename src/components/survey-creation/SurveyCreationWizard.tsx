"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, FileText, Settings, HelpCircle, Eye, Clock, Target, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SurveySettingsStep, SurveySettingsData } from "./SurveySettingsStep"
import { SurveyMetadataStep, SurveyMetadataData } from "./SurveyMetadataStep"
import { QuestionsStep, Question } from "./QuestionsStep"
import { SurveyPreview } from "./SurveyPreview"

export type SurveyCreationStep = "settings" | "metadata" | "questions" | "preview"

interface SurveyData {
    settings?: SurveySettingsData
    metadata?: SurveyMetadataData
    questions: Question[]
}

const STEPS = [
    {
        key: "settings" as SurveyCreationStep,
        title: "Basic Settings",
        description: "Survey title, category & privacy",
        icon: Settings
    },
    {
        key: "metadata" as SurveyCreationStep,
        title: "Survey Details",
        description: "Metadata and targeting",
        icon: FileText
    },
    {
        key: "questions" as SurveyCreationStep,
        title: "Add Questions",
        description: "Create survey questions",
        icon: HelpCircle
    },
    {
        key: "preview" as SurveyCreationStep,
        title: "Preview & Publish",
        description: "Review and launch survey",
        icon: Eye
    }
]

export const SurveyCreationWizard = () => {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<SurveyCreationStep>("settings")
    const [isLoading, setIsLoading] = useState(false)
    const [surveyData, setSurveyData] = useState<SurveyData>({
        questions: []
    })

    // Mock functions - replace these with actual implementation
    const mockCreateSurvey = async (data: SurveyData) => {
        console.log("Mock: Creating survey with data:", data)

        // Simulate API call
        return new Promise<{ id: string, success: boolean }>((resolve) => {
            setTimeout(() => {
                const surveyId = `survey_${Date.now()}`
                console.log("Mock: Survey created with ID:", surveyId)
                resolve({ id: surveyId, success: true })
            }, 2000)
        })
    }

    const handleSettingsComplete = (settings: SurveySettingsData) => {
        setSurveyData(prev => ({ ...prev, settings }))
        setCurrentStep("metadata")
    }

    const handleMetadataComplete = (metadata: SurveyMetadataData) => {
        setSurveyData(prev => ({ ...prev, metadata }))
        setCurrentStep("questions")
    }

    const handleMetadataSkip = () => {
        setCurrentStep("questions")
    }

    const handleQuestionsComplete = (questions: Question[]) => {
        setSurveyData(prev => ({ ...prev, questions }))
        setCurrentStep("preview")
    }

    const handleFinalCreate = async () => {
        if (!surveyData.settings) {
            console.error("No settings data available")
            return
        }

        setIsLoading(true)
        try {
            const result = await mockCreateSurvey(surveyData)
            if (result.success) {
                // Redirect to creator dashboard or survey details
                router.push("/creator")
            }
        } catch (error) {
            console.error("Error creating survey:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToStep = (step: SurveyCreationStep) => {
        setCurrentStep(step)
    }

    const goToStep = (step: SurveyCreationStep) => {
        const stepIndex = STEPS.findIndex(s => s.key === step)
        const currentIndex = STEPS.findIndex(s => s.key === currentStep)

        // Allow going back to previous steps or current step
        if (stepIndex <= currentIndex || isStepCompleted(step)) {
            setCurrentStep(step)
        }
    }

    const isStepCompleted = (step: SurveyCreationStep) => {
        switch (step) {
            case "settings":
                return !!surveyData.settings
            case "metadata":
                return !!surveyData.metadata
            case "questions":
                return surveyData.questions.length > 0
            case "preview":
                return false // Never completed until published
            default:
                return false
        }
    }

    const isStepAccessible = (step: SurveyCreationStep) => {
        const stepIndex = STEPS.findIndex(s => s.key === step)
        const currentIndex = STEPS.findIndex(s => s.key === currentStep)

        return stepIndex <= currentIndex || isStepCompleted(step)
    }

    const canProceedFromCurrent = () => {
        switch (currentStep) {
            case "settings":
                return !!surveyData.settings
            case "metadata":
                return !!surveyData.metadata || true // metadata is optional
            case "questions":
                return surveyData.questions.length > 0
            default:
                return true
        }
    }

    const nextStep = () => {
        const currentIndex = STEPS.findIndex(s => s.key === currentStep)
        if (currentIndex < STEPS.length - 1 && canProceedFromCurrent()) {
            setCurrentStep(STEPS[currentIndex + 1].key)
        }
    }

    const prevStep = () => {
        const currentIndex = STEPS.findIndex(s => s.key === currentStep)
        if (currentIndex > 0) {
            setCurrentStep(STEPS[currentIndex - 1].key)
        }
    }

    const getCurrentStepNumber = () => {
        return STEPS.findIndex(s => s.key === currentStep) + 1
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex gap-8">
                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create New Survey</h1>
                        <p className="text-gray-600">
                            Step {getCurrentStepNumber()} of {STEPS.length}: {STEPS.find(s => s.key === currentStep)?.title}
                        </p>
                    </div>

                    <Card className="min-h-[600px]">
                        <CardContent className="p-8">
                            {currentStep === "settings" && (
                                <SurveySettingsStep
                                    onNext={handleSettingsComplete}
                                    initialData={surveyData.settings}
                                    isLoading={isLoading}
                                />
                            )}

                            {currentStep === "metadata" && surveyData.settings && (
                                <SurveyMetadataStep
                                    onNext={handleMetadataComplete}
                                    onBack={() => handleBackToStep("settings")}
                                    onSkip={handleMetadataSkip}
                                    initialData={surveyData.metadata}
                                    limitScale={surveyData.settings.limitScale}
                                    isLoading={isLoading}
                                />
                            )}

                            {currentStep === "questions" && surveyData.settings && (
                                <QuestionsStep
                                    onComplete={handleQuestionsComplete}
                                    onBack={() => handleBackToStep(surveyData.metadata ? "metadata" : "settings")}
                                    totalQuestions={surveyData.settings.totalQuestions}
                                    limitScale={surveyData.settings.limitScale}
                                    initialQuestions={surveyData.questions}
                                    isLoading={isLoading}
                                />
                            )}

                            {currentStep === "preview" && surveyData.settings && (
                                <SurveyPreview
                                    settings={surveyData.settings}
                                    metadata={surveyData.metadata}
                                    questions={surveyData.questions}
                                    onBack={() => handleBackToStep("questions")}
                                    onConfirm={handleFinalCreate}
                                    isLoading={isLoading}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="neutral"
                            onClick={prevStep}
                            disabled={getCurrentStepNumber() === 1}
                        >
                            Previous
                        </Button>

                        <Button
                            onClick={currentStep === "preview" ? handleFinalCreate : nextStep}
                            disabled={!canProceedFromCurrent() || isLoading}
                        >
                            {currentStep === "preview" ? (isLoading ? 'Publishing...' : 'Publish Survey') : 'Continue'}
                        </Button>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-80 space-y-6">
                    {/* Progress Steps */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Survey Creation Steps</h3>
                            <div className="space-y-4">
                                {STEPS.map((step) => {
                                    const Icon = step.icon
                                    const isActive = currentStep === step.key
                                    const isCompleted = isStepCompleted(step.key)
                                    const isAccessible = isStepAccessible(step.key)

                                    return (
                                        <div
                                            key={step.key}
                                            className={`
                                                flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                                                ${isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                                                ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            onClick={() => isAccessible && goToStep(step.key)}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                                ${isCompleted
                                                    ? 'bg-green-100 text-green-600'
                                                    : isActive
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-gray-100 text-gray-400'
                                                }
                                            `}>
                                                {isCompleted ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Icon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`
                                                    text-sm font-medium
                                                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-700'}
                                                `}>
                                                    {step.title}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {step.description}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Survey Summary */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-4">Survey Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Title:</span>
                                    <div className="font-medium">
                                        {surveyData.settings?.title || "Not set"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Questions:</span>
                                    <div className="font-medium">
                                        {surveyData.questions.length} question(s)
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Target Questions:</span>
                                    <div className="font-medium">
                                        {surveyData.settings?.totalQuestions || "Not set"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Max Responses:</span>
                                    <div className="font-medium">
                                        {surveyData.settings?.respondentLimit || "Unlimited"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Indicator */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-gray-500">
                                    {Math.round((getCurrentStepNumber() / STEPS.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(getCurrentStepNumber() / STEPS.length) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Step {getCurrentStepNumber()} of {STEPS.length} completed
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-3">💡 Tips</h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                {currentStep === "settings" && (
                                    <>
                                        <p>• Choose a clear, descriptive title</p>
                                        <p>• Set realistic question and response limits</p>
                                        <p>• Consider your target audience size</p>
                                    </>
                                )}
                                {currentStep === "metadata" && (
                                    <>
                                        <p>• Define your target audience clearly</p>
                                        <p>• Add relevant tags for better discovery</p>
                                        <p>• This step is optional but recommended</p>
                                    </>
                                )}
                                {currentStep === "questions" && (
                                    <>
                                        <p>• Keep questions clear and concise</p>
                                        <p>• Use different question types for variety</p>
                                        <p>• Mark important questions as required</p>
                                    </>
                                )}
                                {currentStep === "preview" && (
                                    <>
                                        <p>• Review all details carefully</p>
                                        <p>• Test the survey flow</p>
                                        <p>• Ensure all settings are correct</p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold mb-3">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Est. Time:</span>
                                    <span className="font-medium">
                                        {surveyData.questions.length * 1} min
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Limit Scale:</span>
                                    <span className="font-medium">
                                        {surveyData.settings?.limitScale || "Not set"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Privacy:</span>
                                    <span className="font-medium">
                                        FHE Protected
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
