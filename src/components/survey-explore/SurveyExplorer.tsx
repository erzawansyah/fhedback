"use client"

import { useState, useEffect } from "react"

import { SurveyList, PublishedSurvey } from "./SurveyList"
import { SurveyDetailModal } from "./SurveyDetailModal"
import { fetchPublishedSurveys, startSurvey } from "./mockData"

export const SurveyExplorer = () => {
    const [surveys, setSurveys] = useState<PublishedSurvey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedSurvey, setSelectedSurvey] = useState<PublishedSurvey | null>(null)

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


    return (
        <div className="space-y-6 my-4">
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
