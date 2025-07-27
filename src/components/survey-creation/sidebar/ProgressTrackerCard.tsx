"use client"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Target, FileText, HelpCircle } from "lucide-react"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

const ProgressTrackerCard = () => {
    const { steps } = useSurveyCreationContext()

    // Calculate progress
    const progressSteps = [
        { name: "Survey Settings", completed: steps.step1, icon: Target, description: "Configure basic survey parameters" },
        { name: "Metadata", completed: steps.step2, icon: FileText, description: "Add title, description, and labels" },
        { name: "Questions", completed: steps.step3, icon: HelpCircle, description: "Define survey questions" }
    ]

    const completedSteps = progressSteps.filter(step => step.completed).length
    const progressPercentage = (completedSteps / progressSteps.length) * 100
    const allStepsCompleted = steps.step1 && steps.step2 && steps.step3

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Creation Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={allStepsCompleted ? "default" : "neutral"} className="text-xs px-2 py-0.5">
                        {completedSteps}/{progressSteps.length}
                    </Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <Progress value={progressPercentage} className="h-1.5 mb-3" />

            {/* Horizontal Steps */}
            <div className="grid grid-cols-3 gap-2">
                {progressSteps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 hover:scale-105 cursor-pointer ${step.completed
                                ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                            }`}
                        title={step.description}
                    >
                        {step.completed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                            <span className={`text-xs block font-medium leading-tight ${step.completed
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {step.name}
                            </span>
                            <span className={`text-xs ${step.completed
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-500'
                                }`}>
                                {step.completed ? '✓ Done' : 'Pending'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Compact Status Message */}
            {allStepsCompleted ? (
                <div className="mt-2 text-center">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        🎉 Ready to publish!
                    </span>
                </div>
            ) : (
                <div className="mt-2 text-center">
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                        {3 - completedSteps} step{3 - completedSteps > 1 ? 's' : ''} remaining
                    </span>
                </div>
            )}
        </div>
    )
}

export default ProgressTrackerCard
