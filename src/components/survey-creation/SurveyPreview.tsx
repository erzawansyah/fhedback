"use client"

import { useState } from "react"
import { Check, Eye, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { SurveySettingsData } from "./SurveySettingsStep"
import { SurveyMetadataData } from "./SurveyMetadataStep"
import { Question } from "./QuestionsStep"

interface SurveyPreviewProps {
    settings: SurveySettingsData
    metadata?: SurveyMetadataData
    questions: Question[]
    onBack: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export const SurveyPreview = ({
    settings,
    metadata,
    questions,
    onBack,
    onConfirm,
    isLoading = false
}: SurveyPreviewProps) => {
    const [previewMode, setPreviewMode] = useState<"overview" | "respondent">("overview")

    const renderQuestionPreview = (question: Question, index: number) => {
        return (
            <Card key={question.id} className="mb-4">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">
                            {index + 1}. {question.question}
                        </h4>
                        {question.required && (
                            <Badge variant="neutral" className="text-xs">Required</Badge>
                        )}
                    </div>

                    {/* Preview based on question type */}
                    {question.type === "text" && (
                        <input
                            type="text"
                            className="w-full p-2 border rounded bg-gray-50"
                            placeholder="Short text answer..."
                            disabled
                        />
                    )}

                    {question.type === "textarea" && (
                        <textarea
                            className="w-full p-2 border rounded bg-gray-50 h-20"
                            placeholder="Long text answer..."
                            disabled
                        />
                    )}

                    {question.type === "single_choice" && (
                        <div className="space-y-2">
                            {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <input type="radio" name={`question-${question.id}`} disabled />
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {question.type === "multiple_choice" && (
                        <div className="space-y-2">
                            {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <input type="checkbox" disabled />
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {question.type === "rating" && (
                        <div className="flex items-center space-x-2">
                            {metadata?.scaleLabels && (
                                <span className="text-sm text-gray-600">{metadata.scaleLabels.minLabel}</span>
                            )}
                            <div className="flex space-x-1 mx-4">
                                {Array.from({ length: settings.limitScale }, (_, i) => (
                                    <button
                                        key={i}
                                        className="w-8 h-8 border rounded bg-gray-50 text-sm"
                                        disabled
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            {metadata?.scaleLabels && (
                                <span className="text-sm text-gray-600">{metadata.scaleLabels.maxLabel}</span>
                            )}
                        </div>
                    )}

                    {question.type === "yes_no" && (
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <input type="radio" name={`question-${question.id}`} disabled />
                                <span>Yes</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="radio" name={`question-${question.id}`} disabled />
                                <span>No</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {previewMode === "overview" ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Survey Overview</span>
                            <div className="space-x-2">
                                <Button
                                    variant="neutral"
                                    size="sm"
                                    onClick={() => setPreviewMode("respondent")}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview as Respondent
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Survey Settings Summary */}
                        <div>
                            <h3 className="font-semibold mb-3">Survey Settings</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-2xl font-bold text-blue-600">{settings.title}</div>
                                    <div className="text-sm text-gray-600">Title</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-2xl font-bold text-green-600">{questions.length}/{settings.totalQuestions}</div>
                                    <div className="text-sm text-gray-600">Questions</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-2xl font-bold text-purple-600">1-{settings.limitScale}</div>
                                    <div className="text-sm text-gray-600">Rating Scale</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded">
                                    <div className="text-2xl font-bold text-orange-600">{settings.respondentLimit}</div>
                                    <div className="text-sm text-gray-600">Max Respondents</div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Summary */}
                        {metadata && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-3">Display Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium">Display Title: </span>
                                            <span>{metadata.displayTitle}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Category: </span>
                                            <Badge variant="neutral">{metadata.category}</Badge>
                                        </div>
                                        {metadata.description && (
                                            <div>
                                                <span className="font-medium">Description: </span>
                                                <p className="mt-1 text-gray-600">{metadata.description}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Scale Labels: </span>
                                            <span>{metadata.scaleLabels.minLabel} → {metadata.scaleLabels.maxLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Questions Summary */}
                        <Separator />
                        <div>
                            <h3 className="font-semibold mb-3">Questions Overview</h3>
                            <div className="space-y-2">
                                {questions.map((question, index) => (
                                    <div key={question.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <span className="font-medium">{index + 1}. </span>
                                            <span>{question.question}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="neutral">{question.type.replace("_", " ")}</Badge>
                                            {question.required && <Badge variant="neutral">Required</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4">
                            <Button
                                variant="neutral"
                                onClick={onBack}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Edit
                            </Button>

                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                {isLoading ? "Creating..." : "Create Survey"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{metadata?.displayTitle || settings.title}</CardTitle>
                                {metadata?.description && (
                                    <p className="text-gray-600 mt-2">{metadata.description}</p>
                                )}
                                {metadata?.category && (
                                    <Badge variant="neutral" className="mt-2">{metadata.category}</Badge>
                                )}
                            </div>
                            <Button
                                variant="neutral"
                                size="sm"
                                onClick={() => setPreviewMode("overview")}
                            >
                                Back to Overview
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {questions.map((question, index) => renderQuestionPreview(question, index))}

                            <div className="flex justify-center pt-6">
                                <Button disabled className="w-full md:w-auto">
                                    Submit Survey (Preview)
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
