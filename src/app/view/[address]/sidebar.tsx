import { SubmitCard, SurveyDetailsCard } from "@/components/survey-view"
import { Address } from "viem"

interface SurveySidebarProps {
    address: Address
    surveyData: {
        title: string
        category: string
        tags: string[]
        owner: string
        maxScale: number
        minLabel: string
        maxLabel: string
        estimatedTime: number
        reward: number
        currentResponses: number
        maxResponses: number
        questions: string[]
    }
    progress: number
    canSubmit: boolean
    onSubmit: () => void
    isSubmitting: boolean
}

const SurveySidebar = ({ surveyData, progress, canSubmit, onSubmit, isSubmitting }: SurveySidebarProps) => {
    return (
        <div className="sticky top-24 space-y-6 h-fit">


            {/* Submit Card - First priority */}
            <SubmitCard
                progress={progress}
                canSubmit={canSubmit}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                questionsLength={surveyData.questions.length}
                reward={surveyData.reward}
            />

            {/* Survey Details Card - Second priority */}
            <SurveyDetailsCard surveyData={surveyData} />
        </div>
    )
}

export default SurveySidebar
