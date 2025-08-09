"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import {
    Lightbulb,
    ChevronDown,
    ChevronRight,
    Target,
    Shield,
    BarChart3,
    Zap
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"
import { BestPractice, SectionProps } from "../types"
import { BEST_PRACTICES, COMPLETION_STATS } from "../utils/data"

// Practice item component
const PracticeItem: React.FC<{ practice: BestPractice }> = ({ practice }) => {
    const levelColors = {
        beginner: "bg-green-100 text-green-800 border-green-200",
        intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
        advanced: "bg-red-100 text-red-800 border-red-200"
    }

    return (
        <div className="p-3 rounded-base bg-secondary-background border border-border">
            <div className="flex items-start gap-3">
                <practice.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-main" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-mono text-foreground font-bold">
                            {practice.title}
                        </h5>
                        <Badge className={cn(
                            "text-xs font-mono border",
                            levelColors[practice.level]
                        )}>
                            {practice.level}
                        </Badge>
                    </div>
                    <p className="text-xs font-mono text-foreground/70 leading-relaxed">
                        {practice.description}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Practice section component
const PracticeSection: React.FC<SectionProps> = ({
    title,
    icon: Icon,
    practices,
    isOpen,
    onToggle
}) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger
            onClick={onToggle}
            className={cn(
                "flex items-center justify-between w-full p-3 rounded-base",
                "hover:bg-secondary-background transition-colors",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border"
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-main" />
                <h4 className="text-sm font-mono text-foreground font-bold">{title}</h4>
                <Badge className="bg-main/10 text-main border-main/20 text-xs font-mono">
                    {practices.length}
                </Badge>
            </div>
            {isOpen ? (
                <ChevronDown className="w-4 h-4 text-foreground/60" />
            ) : (
                <ChevronRight className="w-4 h-4 text-foreground/60" />
            )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
            {practices.map((practice, index) => (
                <PracticeItem key={index} practice={practice} />
            ))}
        </CollapsibleContent>
    </Collapsible>
)

// Main BestPracticesCard Component
const BestPracticesCard: React.FC = () => {
    const [planningOpen, setPlanningOpen] = React.useState(true)
    const [designOpen, setDesignOpen] = React.useState(false)
    const [privacyOpen, setPrivacyOpen] = React.useState(false)
    const [distributionOpen, setDistributionOpen] = React.useState(false)

    // Calculate completion stats
    const totalPractices = Object.values(BEST_PRACTICES).flat().length
    const completedPractices = 5 // This would come from user progress
    const completionRate = COMPLETION_STATS.getCompletionRate(completedPractices, totalPractices)

    return (
        <Card className="bg-background border-2 border-border shadow-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                    <Lightbulb className="w-5 h-5 text-main" />
                    Best Practices
                </CardTitle>

                {/* Progress indicator */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-foreground/70">
                            Progress: {completedPractices}/{totalPractices}
                        </span>
                        <span className="text-xs font-mono text-foreground/70">
                            {completionRate}%
                        </span>
                    </div>
                    <Progress
                        value={completionRate}
                        className="h-2 bg-secondary-background border border-border"
                    />
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
                {/* Planning Section - Open by default */}
                <PracticeSection
                    title="Planning"
                    icon={Target}
                    practices={BEST_PRACTICES.planning}
                    isOpen={planningOpen}
                    onToggle={() => setPlanningOpen(!planningOpen)}
                />

                {/* Design Section */}
                <PracticeSection
                    title="Design"
                    icon={BarChart3}
                    practices={BEST_PRACTICES.design}
                    isOpen={designOpen}
                    onToggle={() => setDesignOpen(!designOpen)}
                />

                {/* Privacy Section */}
                <PracticeSection
                    title="Privacy"
                    icon={Shield}
                    practices={BEST_PRACTICES.privacy}
                    isOpen={privacyOpen}
                    onToggle={() => setPrivacyOpen(!privacyOpen)}
                />

                {/* Distribution Section */}
                <PracticeSection
                    title="Distribution"
                    icon={Zap}
                    practices={BEST_PRACTICES.distribution}
                    isOpen={distributionOpen}
                    onToggle={() => setDistributionOpen(!distributionOpen)}
                />

                {/* Summary stats */}
                <div className={cn(
                    "mt-4 p-3 rounded-base bg-main/10 border-2 border-main/20"
                )}>
                    <div className="text-center space-y-2">
                        <h5 className="text-sm font-mono text-foreground font-bold">
                            Survey Quality Score
                        </h5>
                        <div className="flex justify-center items-center gap-4">
                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-main">
                                    {Math.round(completionRate * 0.85)}%
                                </div>
                                <div className="text-xs font-mono text-foreground/70">
                                    Quality
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-main">
                                    {COMPLETION_STATS.getTimeEstimate(8)}
                                </div>
                                <div className="text-xs font-mono text-foreground/70">
                                    Est. Time
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BestPracticesCard
