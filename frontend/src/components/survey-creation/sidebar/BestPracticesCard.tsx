"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Lightbulb,
    CheckCircle,
    Target,
    Users,
    Clock,
    ChevronDown,
    ChevronRight,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

// Types for better modularity
interface BestPractice {
    id: string
    title: string
    description: string
    icon: React.ElementType
    priority: 'high' | 'medium' | 'low'
    category: 'design' | 'content' | 'technical' | 'engagement'
}

interface SectionProps {
    title: string
    icon: React.ElementType
    isOpen: boolean
    onToggle: () => void
    children: React.ReactNode
}

// Modular Section Component
const PracticeSection: React.FC<SectionProps> = ({ title, icon: Icon, isOpen, onToggle, children }) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger
            onClick={onToggle}
            className={cn(
                "flex items-center justify-between w-full p-2 rounded-base",
                "hover:bg-secondary-background transition-colors",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border"
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-foreground" />
                <h4 className="text-sm font-mono text-foreground">{title}</h4>
            </div>
            {isOpen ? (
                <ChevronDown className="w-4 h-4 text-foreground" />
            ) : (
                <ChevronRight className="w-4 h-4 text-foreground" />
            )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
            {children}
        </CollapsibleContent>
    </Collapsible>
)

// Modular Practice Item Component
const PracticeItem: React.FC<{ practice: BestPractice }> = ({ practice }) => {
    const { icon: Icon, title, description, priority } = practice

    const getPriorityColor = (priority: BestPractice['priority']) => {
        switch (priority) {
            case 'high': return 'text-danger bg-danger/10'
            case 'medium': return 'text-warning bg-warning/10'
            case 'low': return 'text-success bg-success/10'
            default: return 'text-foreground bg-secondary-background'
        }
    }

    return (
        <div className={cn(
            "p-3 rounded-base border-2 border-border bg-background",
            "space-y-2"
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <Icon className="w-4 h-4 text-main flex-shrink-0" />
                    <h5 className="text-sm font-mono text-foreground">{title}</h5>
                </div>
                <Badge
                    variant="neutral"
                    className={cn("text-xs", getPriorityColor(priority))}
                >
                    {priority}
                </Badge>
            </div>
            <p className="text-xs font-mono text-foreground/80 pl-6">
                {description}
            </p>
        </div>
    )
}

// Main BestPracticesCard Component
const BestPracticesCard: React.FC = () => {
    const { steps, config, questions } = useSurveyCreationContext()

    // State for collapsible sections
    const [designOpen, setDesignOpen] = React.useState(true)
    const [contentOpen, setContentOpen] = React.useState(false)
    const [engagementOpen, setEngagementOpen] = React.useState(false)

    // Best practices data
    const bestPractices: BestPractice[] = [
        {
            id: 'clear-title',
            title: 'Clear & Descriptive Title',
            description: 'Use a title that clearly explains the survey purpose to increase response rates.',
            icon: Target,
            priority: 'high',
            category: 'design'
        },
        {
            id: 'appropriate-length',
            title: 'Optimal Length',
            description: 'Keep surveys between 5-10 questions for better completion rates.',
            icon: Clock,
            priority: 'high',
            category: 'design'
        },
        {
            id: 'clear-questions',
            title: 'Clear Questions',
            description: 'Write questions that are easy to understand and avoid jargon.',
            icon: CheckCircle,
            priority: 'high',
            category: 'content'
        },
        {
            id: 'consistent-scale',
            title: 'Consistent Scale',
            description: 'Use the same rating scale (1-5, 1-7, etc.) throughout your survey.',
            icon: Target,
            priority: 'medium',
            category: 'content'
        },
        {
            id: 'target-audience',
            title: 'Know Your Audience',
            description: 'Tailor your questions and language to your target demographic.',
            icon: Users,
            priority: 'medium',
            category: 'engagement'
        },
        {
            id: 'test-before-launch',
            title: 'Test Before Publishing',
            description: 'Review all questions and test the survey flow before going live.',
            icon: CheckCircle,
            priority: 'high',
            category: 'engagement'
        }
    ]

    // Filter practices by category
    const designPractices = bestPractices.filter(p => p.category === 'design')
    const contentPractices = bestPractices.filter(p => p.category === 'content')
    const engagementPractices = bestPractices.filter(p => p.category === 'engagement')

    // Show card only when not all steps are completed
    const shouldShow = !steps.step1 || !steps.step2 || !steps.step3

    if (!shouldShow) return null

    return (
        <Card className="bg-background border-2 border-border shadow-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                    <Lightbulb className="w-5 h-5 text-main" />
                    Best Practices
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                {/* Current Progress Indicator */}
                <div className={cn(
                    "p-3 rounded-base border-2 border-border bg-main/10",
                    "flex items-center gap-2"
                )}>
                    <AlertCircle className="w-4 h-4 text-main flex-shrink-0" />
                    <div className="text-xs font-mono text-foreground">
                        <span className="font-bold">Tip:</span> Following these practices can improve response rates by up to 40%
                    </div>
                </div>

                <Separator className="bg-border" />

                {/* Design Practices */}
                <PracticeSection
                    title="Survey Design"
                    icon={Target}
                    isOpen={designOpen}
                    onToggle={() => setDesignOpen(!designOpen)}
                >
                    <div className="space-y-3">
                        {designPractices.map(practice => (
                            <PracticeItem key={practice.id} practice={practice} />
                        ))}
                    </div>
                </PracticeSection>

                {/* Content Practices */}
                <PracticeSection
                    title="Content Quality"
                    icon={CheckCircle}
                    isOpen={contentOpen}
                    onToggle={() => setContentOpen(!contentOpen)}
                >
                    <div className="space-y-3">
                        {contentPractices.map(practice => (
                            <PracticeItem key={practice.id} practice={practice} />
                        ))}
                    </div>
                </PracticeSection>

                {/* Engagement Practices */}
                <PracticeSection
                    title="User Engagement"
                    icon={Users}
                    isOpen={engagementOpen}
                    onToggle={() => setEngagementOpen(!engagementOpen)}
                >
                    <div className="space-y-3">
                        {engagementPractices.map(practice => (
                            <PracticeItem key={practice.id} practice={practice} />
                        ))}
                    </div>
                </PracticeSection>

                {/* Quick Stats */}
                <div className={cn(
                    "p-3 rounded-base bg-secondary-background border-2 border-border",
                    "grid grid-cols-2 gap-3 text-xs font-mono"
                )}>
                    <div className="text-center">
                        <div className="text-main font-bold text-sm">{questions?.length || 0}/10</div>
                        <div className="text-foreground/70">Questions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-main font-bold text-sm">{config?.limitScale || 5}</div>
                        <div className="text-foreground/70">Scale Range</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BestPracticesCard
