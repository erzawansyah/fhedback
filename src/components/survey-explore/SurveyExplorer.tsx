"use client"

import { useState, useEffect } from "react"
import { RefreshCw, TrendingUp, Clock, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SurveyList, PublishedSurvey } from "./SurveyList"
import { SurveyDetailModal } from "./SurveyDetailModal"
import { fetchPublishedSurveys, startSurvey } from "./mockData"

export const SurveyExplorer = () => {
    const [surveys, setSurveys] = useState<PublishedSurvey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedSurvey, setSelectedSurvey] = useState<PublishedSurvey | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Load surveys on component mount
    useEffect(() => {
        loadSurveys()
    }, [])

    const loadSurveys = async () => {
        try {
            const surveyData = await fetchPublishedSurveys()
            setSurveys(surveyData)
        } catch (error) {
            console.error("Error loading surveys:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const surveyData = await fetchPublishedSurveys()
            setSurveys(surveyData)
        } catch (error) {
            console.error("Error refreshing surveys:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleSurveyClick = (survey: PublishedSurvey) => {
        setSelectedSurvey(survey)
    }

    const handleStartSurvey = async (surveyId: string) => {
        try {
            const result = await startSurvey(surveyId)
            if (result.success && result.redirectUrl) {
                // For now, we'll just close the modal and show a message
                // In a real app, you would navigate to the survey taking page
                setSelectedSurvey(null)
                console.log("Would redirect to:", result.redirectUrl)

                // Mock: Update survey as answered
                setSurveys(prev => prev.map(s =>
                    s.id === surveyId ? { ...s, hasAnswered: true } : s
                ))
            }
        } catch (error) {
            console.error("Error starting survey:", error)
        }
    }

    const handleCloseModal = () => {
        setSelectedSurvey(null)
    }

    // Calculate stats
    const totalSurveys = surveys.length
    const activeSurveys = surveys.filter(s => s.isActive).length
    const totalRewards = surveys.reduce((sum, s) => sum + s.rewardAmount, 0)
    const avgCompletionTime = Math.round(
        surveys.reduce((sum, s) => sum + s.estimatedTime, 0) / surveys.length
    )

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Explore Surveys</h1>
                        <p className="text-gray-600">
                            Discover and participate in surveys from the community. Earn tokens while sharing your opinions.
                        </p>
                    </div>
                    <Button
                        variant="neutral"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                                    <p className="text-2xl font-bold">{totalSurveys}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">Active Surveys</p>
                                    <p className="text-2xl font-bold text-green-600">{activeSurveys}</p>
                                </div>
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                                    <p className="text-2xl font-bold text-purple-600">{totalRewards}</p>
                                    <p className="text-xs text-gray-500">tokens available</p>
                                </div>
                                <Award className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                                    <p className="text-2xl font-bold text-orange-600">{avgCompletionTime}</p>
                                    <p className="text-xs text-gray-500">minutes</p>
                                </div>
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Survey List */}
            <SurveyList
                surveys={surveys}
                onSurveyClick={handleSurveyClick}
                isLoading={isLoading}
            />

            {/* Survey Detail Modal */}
            {selectedSurvey && (
                <SurveyDetailModal
                    survey={selectedSurvey}
                    onClose={handleCloseModal}
                    onStartSurvey={handleStartSurvey}
                />
            )}
        </div>
    )
}
