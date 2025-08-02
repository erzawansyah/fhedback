"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    ExternalLink,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    BookOpen,
    FileText,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"
import { QuickAction, ActionSectionProps } from "../types"
import { QUICK_ACTIONS } from "../utils/data"

// Modular Action Button Component
const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => (
    <Button
        variant="neutral"
        size="sm"
        className={cn(
            "w-full justify-start h-auto p-3",
            "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
            "transition-all duration-200"
        )}
        onClick={() => window.open(action.href, action.external ? '_blank' : '_self')}
    >
        <div className="flex items-start gap-3 w-full">
            <action.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-main" />
            <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-mono text-foreground">{action.label}</span>
                    {action.external && <ExternalLink className="w-3 h-3 text-foreground/60" />}
                </div>
                <p className="text-xs font-mono text-foreground/70 leading-tight line-clamp-2">
                    {action.description}
                </p>
            </div>
        </div>
    </Button>
)

// Modular Section Header Component
const SectionHeader: React.FC<{
    icon: React.ElementType
    title: string
    isOpen: boolean
    onToggle: () => void
}> = ({ icon: Icon, title, isOpen, onToggle }) => (
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
            <h4 className="text-sm font-mono text-foreground">{title}</h4>
        </div>
        {isOpen ? (
            <ChevronDown className="w-4 h-4 text-foreground/60" />
        ) : (
            <ChevronRight className="w-4 h-4 text-foreground/60" />
        )}
    </CollapsibleTrigger>
)

// Modular Action Section Component
const ActionSection: React.FC<ActionSectionProps> = ({
    title,
    icon,
    isOpen,
    onToggle,
    actions
}) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
        <SectionHeader
            icon={icon}
            title={title}
            isOpen={isOpen}
            onToggle={onToggle}
        />
        <CollapsibleContent className="space-y-2 mt-2">
            {actions.map((action, index) => (
                <ActionButton key={index} action={action} />
            ))}
        </CollapsibleContent>
    </Collapsible>
)

// Main QuickActionsCard Component
const QuickActionsCard: React.FC = () => {
    const [learningOpen, setLearningOpen] = React.useState(true)
    const [resourcesOpen, setResourcesOpen] = React.useState(false)
    const [supportOpen, setSupportOpen] = React.useState(false)
    const [toolsOpen, setToolsOpen] = React.useState(false)

    return (
        <Card className="bg-background border-2 border-border shadow-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                    <HelpCircle className="w-5 h-5 text-main" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
                {/* Learning Section - Open by default */}
                <ActionSection
                    title="Learning"
                    icon={BookOpen}
                    isOpen={learningOpen}
                    onToggle={() => setLearningOpen(!learningOpen)}
                    actions={QUICK_ACTIONS.learn}
                />

                {/* Resources Section */}
                <ActionSection
                    title="Resources"
                    icon={FileText}
                    isOpen={resourcesOpen}
                    onToggle={() => setResourcesOpen(!resourcesOpen)}
                    actions={QUICK_ACTIONS.resources}
                />

                {/* Support Section */}
                <ActionSection
                    title="Support"
                    icon={HelpCircle}
                    isOpen={supportOpen}
                    onToggle={() => setSupportOpen(!supportOpen)}
                    actions={QUICK_ACTIONS.support}
                />

                {/* Tools Section */}
                <ActionSection
                    title="Tools"
                    icon={BarChart3}
                    isOpen={toolsOpen}
                    onToggle={() => setToolsOpen(!toolsOpen)}
                    actions={QUICK_ACTIONS.tools}
                />

                {/* Featured Action - Always visible */}
                <div className={cn(
                    "mt-4 p-3 rounded-base bg-main/10 border-2 border-main/20"
                )}>
                    <div className="text-center space-y-2">
                        <h5 className="text-sm font-mono text-foreground font-bold">
                            Need Help?
                        </h5>
                        <p className="text-xs font-mono text-foreground/70">
                            Check our documentation or join the community for support.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default QuickActionsCard
