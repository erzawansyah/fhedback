"use client"
import PageTitle from "@/components/layout/page-title"
import { SurveyMetadataStep, SurveySettingsStep } from "@/components/survey-creation"
import { useSurveyCreation } from "@/context/SurveyCreationContext"
import { CirclePlus, SquarePen } from "lucide-react"

const NewSurveyPage = () => {
    const { config, resetSurveyConfig } = useSurveyCreation();

    const resetSurvey = () => {
        resetSurveyConfig();
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
                    <SurveySettingsStep />
                    {
                        config.status === "initialized" && <SurveyMetadataStep />
                    }
                </div>
                <div className="col-span-4 lg:col-span-1 bg-background p-4">
                    {
                        config.address ? (
                            <>
                                <p className="text-sm text-gray-600">
                                    Your survey has been created! You can view it{" "}
                                    <a
                                        href={`/surveys/${config.address}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        here
                                    </a>.
                                </p>
                                <ol>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">Survey Title:</span> {config.title}
                                    </li>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">Total Questions:</span> {config.totalQuestions}
                                    </li>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">Respondent Limit:</span> {config.respondentLimit}
                                    </li>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">Scale Limit:</span> {config.limitScale}
                                    </li>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">FHE Enabled:</span> {config.isFhe ? "Yes" : "No"}
                                    </li>
                                    <li className="text-sm text-gray-600">
                                        <span className="font-semibold">Status:</span> {config.status}
                                    </li>
                                </ol>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Please fill out the survey settings to get started.
                            </p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default NewSurveyPage
