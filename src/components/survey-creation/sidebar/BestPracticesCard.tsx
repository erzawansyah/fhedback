"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    AlertTriangle,
    CheckSquare,
    FileText,
    Users,
    Lock,
    Lightbulb,
    Clock,
    Shield,
    Zap,
    ChevronDown,
    ChevronRight
} from "lucide-react"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

const BestPracticesCard = () => {
    const { steps } = useSurveyCreationContext()
    const [criticalOpen, setCriticalOpen] = useState(true)
    const [importantOpen, setImportantOpen] = useState(false)
    const [tipsOpen, setTipsOpen] = useState(false)

    // Only show when not all steps are completed
    const allStepsCompleted = steps.step1 && steps.step2 && steps.step3

    if (allStepsCompleted) {
        return null
    }

    const practices = {
        critical: [
            {
                icon: FileText,
                title: "Prepare Content in Advance",
                description: "Have all survey questions, descriptions, and metadata ready before deployment"
            },
            {
                icon: Lock,
                title: "Survey Immutability",
                description: "Once deployed and published, survey content cannot be modified"
            }
        ],
        important: [
            {
                icon: Users,
                title: "Target Audience",
                description: "Define your respondent limit based on your target audience size"
            },
            {
                icon: Shield,
                title: "Privacy Considerations",
                description: "Choose FHE encryption for sensitive data or public surveys for transparency"
            }
        ],
        helpful: [
            {
                icon: Clock,
                title: "Question Length",
                description: "Keep questions concise (5-15 words) for better completion rates"
            },
            {
                icon: CheckSquare,
                title: "Scale Labels",
                description: "Use clear min/max labels to help respondents understand the rating scale"
            },
            {
                icon: Zap,
                title: "Test Before Publishing",
                description: "Review all settings and preview your survey before final publication"
            }
        ]
    }

    return (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                    <Lightbulb className="w-4 h-4" />
                    Best Practices
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">
                    {/* Critical Practices - Compact version */}
                    <Collapsible open={criticalOpen} onOpenChange={setCriticalOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <Badge variant="default" className="text-xs bg-red-100 text-red-800 border-red-300 px-1 py-0">
                                    Critical
                                </Badge>
                            </div>
                            {criticalOpen ?
                                <ChevronDown className="w-3 h-3 text-red-600" /> :
                                <ChevronRight className="w-3 h-3 text-red-600" />
                            }
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {practices.critical.map((practice, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                                    <practice.icon className="w-3 h-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-red-800 dark:text-red-200">
                                            {practice.title}
                                        </p>
                                        <p className="text-xs text-red-700 dark:text-red-300 leading-tight">
                                            {practice.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Important Practices - Compact version */}
                    <Collapsible open={importantOpen} onOpenChange={setImportantOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <Badge variant="default" className="text-xs bg-amber-100 text-amber-800 border-amber-300 px-1 py-0">
                                    Important
                                </Badge>
                            </div>
                            {importantOpen ?
                                <ChevronDown className="w-3 h-3 text-amber-600" /> :
                                <ChevronRight className="w-3 h-3 text-amber-600" />
                            }
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {practices.important.map((practice, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                                    <practice.icon className="w-3 h-3 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                                            {practice.title}
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-tight">
                                            {practice.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Helpful Tips - Compact version */}
                    <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-3 h-3 text-blue-600" />
                                <Badge variant="neutral" className="text-xs px-1 py-0">
                                    Tips
                                </Badge>
                            </div>
                            {tipsOpen ?
                                <ChevronDown className="w-3 h-3 text-blue-600" /> :
                                <ChevronRight className="w-3 h-3 text-blue-600" />
                            }
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {practices.helpful.map((practice, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md transition-colors">
                                    <practice.icon className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                            {practice.title}
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
                                            {practice.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Quick Reminder - Compact version */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 p-2 rounded-md">
                        <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-0.5">
                            💡 Remember
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 leading-tight">
                            Blockchain surveys are immutable by design. Take time to review everything before publishing.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BestPracticesCard
