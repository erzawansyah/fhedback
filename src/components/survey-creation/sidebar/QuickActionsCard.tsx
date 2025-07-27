"use client"
import React, { useState } from "react"
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
    Lightbulb,
    MessageSquare,
    Github,
    Video,
    Download,
    ChevronDown,
    ChevronRight
} from "lucide-react"

const QuickActionsCard = () => {
    const [learningOpen, setLearningOpen] = useState(true)
    const [resourcesOpen, setResourcesOpen] = useState(false)
    const [supportOpen, setSupportOpen] = useState(false)
    const [toolsOpen, setToolsOpen] = useState(false)

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

    const ActionButton = ({ action }: { action: typeof actions.learn[0] }) => (
        <Button
            variant="neutral"
            size="sm"
            className="w-full justify-start h-auto p-2"
            onClick={() => window.open(action.href, action.external ? '_blank' : '_self')}
        >
            <div className="flex items-start gap-2 w-full">
                <action.icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{action.label}</span>
                        {action.external && <ExternalLink className="w-3 h-3 opacity-60" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-tight">
                        {action.description}
                    </p>
                </div>
            </div>
        </Button>
    )

    const SectionHeader = ({
        icon: Icon,
        title,
        isOpen,
        onToggle
    }: {
        icon: React.ElementType,
        title: string,
        isOpen: boolean,
        onToggle: () => void
    }) => (
        <CollapsibleTrigger
            onClick={onToggle}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-3 h-3" />
                <h4 className="text-xs font-semibold text-muted-foreground">{title}</h4>
            </div>
            {isOpen ?
                <ChevronDown className="w-3 h-3 text-muted-foreground" /> :
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
            }
        </CollapsibleTrigger>
    )

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">
                    {/* Learning Resources - Compact */}
                    <Collapsible open={learningOpen} onOpenChange={setLearningOpen}>
                        <SectionHeader
                            icon={BookOpen}
                            title="Learning"
                            isOpen={learningOpen}
                            onToggle={() => setLearningOpen(!learningOpen)}
                        />
                        <CollapsibleContent className="space-y-1 mt-1">
                            {actions.learn.map((action, index) => (
                                <ActionButton key={index} action={action} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Resources - Compact */}
                    <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
                        <SectionHeader
                            icon={FileText}
                            title="Resources"
                            isOpen={resourcesOpen}
                            onToggle={() => setResourcesOpen(!resourcesOpen)}
                        />
                        <CollapsibleContent className="space-y-1 mt-1">
                            {actions.resources.map((action, index) => (
                                <ActionButton key={index} action={action} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Support */}
                    <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                        <SectionHeader
                            icon={HelpCircle}
                            title="Support"
                            isOpen={supportOpen}
                            onToggle={() => setSupportOpen(!supportOpen)}
                        />
                        <CollapsibleContent className="space-y-1 mt-2">
                            {actions.support.map((action, index) => (
                                <ActionButton key={index} action={action} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Tools */}
                    <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                        <SectionHeader
                            icon={BarChart3}
                            title="Tools"
                            isOpen={toolsOpen}
                            onToggle={() => setToolsOpen(!toolsOpen)}
                        />
                        <CollapsibleContent className="space-y-1 mt-2">
                            {actions.tools.map((action, index) => (
                                <ActionButton key={index} action={action} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Featured Action - Always visible */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                New to FHEDback?
                            </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                            Watch our 5-minute tutorial to get started with creating your first survey.
                        </p>
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open("https://youtube.com/watch?v=fhedback-intro", '_blank')}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Watch Tutorial
                            <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default QuickActionsCard
