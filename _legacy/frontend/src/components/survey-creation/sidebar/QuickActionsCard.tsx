"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    BookOpen,
    ExternalLink,
    FileText,
    Users,
    BarChart3,
    HelpCircle,
    Target,
    MessageSquare,
    Github,
    Video,
    Download,
    ChevronDown,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"

// Types for better modularity
interface QuickAction {
    icon: React.ElementType
    label: string
    description: string
    href: string
    external: boolean
}

interface ActionSectionProps {
    title: string
    icon: React.ElementType
    isOpen: boolean
    onToggle: () => void
    actions: QuickAction[]
}

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

    // Actions data organized by category
    const actions = {
        learn: [
            {
                icon: BookOpen,
                label: "Documentation",
                description: "Complete guide for creating surveys",
                href: "/docs",
                external: true
            },
            {
                icon: Video,
                label: "Video Tutorials",
                description: "Step-by-step video guides",
                href: "https://youtube.com/@fhedback-tutorials",
                external: true
            },
            {
                icon: Target,
                label: "Best Practices",
                description: "Tips for effective surveys",
                href: "/docs/best-practices",
                external: true
            }
        ],
        resources: [
            {
                icon: FileText,
                label: "Blog",
                description: "Latest updates and case studies",
                href: "/blog",
                external: true
            },
            {
                icon: Download,
                label: "Templates",
                description: "Pre-made survey templates",
                href: "/templates",
                external: true
            }
        ],
        support: [
            {
                icon: MessageSquare,
                label: "Community",
                description: "Join our Discord community",
                href: "https://discord.gg/fhedback",
                external: true
            },
            {
                icon: Github,
                label: "GitHub",
                description: "Source code and issues",
                href: "https://github.com/fhedback/platform",
                external: true
            }
        ],
        tools: [
            {
                icon: BarChart3,
                label: "Analytics Dashboard",
                description: "View all your survey analytics",
                href: "/creator/analytics",
                external: true
            },
            {
                icon: Users,
                label: "Survey Explorer",
                description: "Browse public surveys",
                href: "/explore",
                external: true
            }
        ]
    }

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
                    actions={actions.learn}
                />

                {/* Resources Section */}
                <ActionSection
                    title="Resources"
                    icon={FileText}
                    isOpen={resourcesOpen}
                    onToggle={() => setResourcesOpen(!resourcesOpen)}
                    actions={actions.resources}
                />

                {/* Support Section */}
                <ActionSection
                    title="Support"
                    icon={HelpCircle}
                    isOpen={supportOpen}
                    onToggle={() => setSupportOpen(!supportOpen)}
                    actions={actions.support}
                />

                {/* Tools Section */}
                <ActionSection
                    title="Tools"
                    icon={BarChart3}
                    isOpen={toolsOpen}
                    onToggle={() => setToolsOpen(!toolsOpen)}
                    actions={actions.tools}
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
