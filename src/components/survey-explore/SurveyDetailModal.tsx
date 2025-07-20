"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Star, Users, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublishedSurvey } from "./SurveyList"

interface SurveyDetailModalProps {
    survey: PublishedSurvey
    onClose: () => void
    onStartSurvey: (surveyId: string) => void
}

export const SurveyDetailModal = ({ survey, onClose, onStartSurvey }: SurveyDetailModalProps) => {
    const [isStarting, setIsStarting] = useState(false)

    const handleStartSurvey = async () => {
        setIsStarting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate loading
            onStartSurvey(survey.id)
        } catch (error) {
            console.error("Error starting survey:", error)
        } finally {
            setIsStarting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getProgressPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="neutral">{survey.category}</Badge>
                                {survey.hasAnswered && (
                                    <Badge variant="default">Completed</Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl mb-2">{survey.title}</CardTitle>
                            <p className="text-gray-600">{survey.description}</p>
                        </div>
                        <Button
                            variant="neutral"
                            size="sm"
                            onClick={onClose}
                            className="ml-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Survey Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-blue-600">{survey.totalQuestions}</div>
                            <div className="text-sm text-gray-600">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-green-600">~{survey.estimatedTime}</div>
                            <div className="text-sm text-gray-600">Minutes</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-purple-600">{survey.rewardAmount}</div>
                            <div className="text-sm text-gray-600">Tokens</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl font-bold text-orange-600">
                                {survey.averageRating ? survey.averageRating.toFixed(1) : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">Rating</div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Survey Creator</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{survey.creator}</p>
                                <p className="text-sm text-gray-600">Created on {formatDate(survey.createdAt)}</p>
                            </div>
                            {survey.averageRating && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{survey.averageRating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Progress */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Response Progress</h4>
                            <span className="text-sm text-gray-600">
                                {survey.respondentCount} / {survey.maxRespondents} responses
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(survey.respondentCount, survey.maxRespondents)}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            {getProgressPercentage(survey.respondentCount, survey.maxRespondents)}% complete
                        </p>
                    </div>

                    {/* Survey Details */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Survey Details</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Estimated completion time: {survey.estimatedTime} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>Currently {survey.respondentCount} people have responded</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span>
                                    {survey.rewardAmount > 0
                                        ? `Earn ${survey.rewardAmount} tokens upon completion`
                                        : "Free survey - no reward"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {survey.tags.length > 0 && (
                        <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {survey.tags.map((tag, index) => (
                                    <Badge key={index} variant="neutral" className="text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="neutral"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>

                        {survey.hasAnswered ? (
                            <Button
                                variant="neutral"
                                className="flex-1"
                                disabled
                            >
                                Already Completed
                            </Button>
                        ) : survey.respondentCount >= survey.maxRespondents ? (
                            <Button
                                variant="neutral"
                                className="flex-1"
                                disabled
                            >
                                Survey Full
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStartSurvey}
                                disabled={isStarting}
                                className="flex-1"
                            >
                                {isStarting ? "Starting..." : "Start Survey"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
