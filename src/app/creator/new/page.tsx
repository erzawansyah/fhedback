"use client"
import React from "react"
import PageTitle from "@/components/layout/page-title"
import { SurveyMetadataStep, SurveyQuestionsStep, SurveySettingsStep } from "@/components/survey-creation"
import { useSurveyCreation } from "@/context/SurveyCreationContext"
import { CirclePlus, SquarePen } from "lucide-react"
import NewSurveySidebar from "./sidebar"

const NewSurveyPage = () => {
    const { config, resetSurveyConfig, refreshed } = useSurveyCreation();
    /**
     * Handle survey reset action
     * This will clear all survey configuration and start fresh
     */
    const resetSurvey = () => {
        resetSurveyConfig();
    }

    // Show loading state during refresh
    if (refreshed) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-600">Survey configuration is being refreshed...</p>
            </div>
        );
    }

    return (
        <div>
            <PageTitle
                title="Create New Survey"
                description="Start creating your survey by following the steps in the wizard below."
                titleIcon={<SquarePen size={32} className="text-main" />}
                handleAction={resetSurvey}
                actionIcon={<CirclePlus className="w-4 h-4" />}
                actionText="Reset Survey"
            />
            <div className="grid grid-cols-4 gap-6 min-h-92">
                <div className="col-span-4 lg:col-span-3 space-y-6">
                    {/* Step 1: Survey Settings - Always visible */}
                    <SurveySettingsStep />

                    {/* Step 2: Survey Metadata - Only visible after survey is created */}
                    {config.address && (
                        <SurveyMetadataStep />
                    )}
                    {/* Step 3: Survey Questions - Only visible after metadata is set */}
                    {config.metadataCid && (
                        <SurveyQuestionsStep />
                    )}
                </div>
                <div className="col-span-4 lg:col-span-1">
                    <NewSurveySidebar />
                </div>
            </div>
        </div>
    )
}

export default NewSurveyPage
