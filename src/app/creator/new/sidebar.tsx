"use client"
import React from "react"
import {
    PublishSurveyCard,
    BestPracticesCard,
    QuickActionsCard,
    SurveyUtilitiesCard,
    TechnicalInfoCard
} from "@/components/survey-creation/sidebar"

const NewSurveySidebar = () => {
    return (
        <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Publish Survey Card - Shows when all steps completed and survey not published yet */}
            <PublishSurveyCard />

            {/* Best Practices - Shows when steps are not all completed */}
            <BestPracticesCard />

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Survey Utilities */}
            <SurveyUtilitiesCard />

            {/* Technical Information - Only shows when survey is deployed */}
            <TechnicalInfoCard />
        </div>
    )
}

export default NewSurveySidebar
