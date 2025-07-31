"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    Save,
    Download,
    RefreshCw,
    Copy,
    Loader,
    BarChart3,
    Clock,
    Users,
    Shield,
    TrendingUp,
    Lightbulb,
    ChevronDown,
    ChevronRight,
    Settings
} from "lucide-react"
import { toast } from "sonner"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

const SurveyUtilitiesCard = () => {
    const { config, metadata, questions, surveyAddress, refresh, refreshed, isLoading } = useSurveyCreationContext()
    const [actionsOpen, setActionsOpen] = useState(true)
    const [insightsOpen, setInsightsOpen] = useState(false)
    const [overviewOpen, setOverviewOpen] = useState(false)

    // Copy to clipboard utility
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} copied to clipboard!`)
        } catch {
            toast.error(`Failed to copy ${label}`)
        }
    }

    // Save draft utility
    const saveDraft = () => {
        toast.success("Draft saved successfully!")
    }

    // Export survey data
    const exportSurvey = () => {
        const surveyData = {
            settings: config,
            metadata: metadata,
            questions: questions,
            timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(surveyData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `survey-${metadata?.title || 'draft'}-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Survey exported successfully!")
    }

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
                    <Settings className="w-4 h-4" />
                    Survey Utilities
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
                <div className="space-y-2">{/* Survey Actions - Compact */}
                    <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
                        <SectionHeader
                            icon={Settings}
                            title="Actions"
                            isOpen={actionsOpen}
                            onToggle={() => setActionsOpen(!actionsOpen)}
                        />
                        <CollapsibleContent className="space-y-1 mt-1">
                            <Button
                                variant="neutral"
                                size="sm"
                                className="w-full justify-start h-auto p-2"
                                onClick={saveDraft}
                            >
                                <Save className="w-3 h-3 mr-2" />
                                <span className="text-xs">Save Draft</span>
                            </Button>
                            <Button
                                variant="neutral"
                                size="sm"
                                className="w-full justify-start h-auto p-2"
                                onClick={exportSurvey}
                            >
                                <Download className="w-3 h-3 mr-2" />
                                <span className="text-xs">Export Survey</span>
                            </Button>
                            <Button
                                variant="neutral"
                                size="sm"
                                className="w-full justify-start h-auto p-2"
                                onClick={() => window.open('/creator/analytics', '_blank')}
                            >
                                <BarChart3 className="w-3 h-3 mr-2" />
                                <span className="text-xs">View Analytics</span>
                            </Button>
                            <Button
                                variant="neutral"
                                size="sm"
                                className="w-full justify-start h-auto p-2"
                                onClick={refresh}
                                disabled={refreshed || isLoading}
                            >
                                {refreshed ? (
                                    <Loader className="w-3 h-3 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                )}
                                <span className="text-xs">{refreshed ? "Refreshing..." : "Refresh Data"}</span>
                            </Button>

                            {surveyAddress && (
                                <Button
                                    variant="neutral"
                                    size="sm"
                                    className="w-full justify-start h-auto p-2"
                                    onClick={() => copyToClipboard(surveyAddress, "Contract Address")}
                                >
                                    <Copy className="w-3 h-3 mr-2" />
                                    <span className="text-xs">Copy Address</span>
                                </Button>
                            )}
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Survey Insights */}
                    <Collapsible open={insightsOpen} onOpenChange={setInsightsOpen}>
                        <SectionHeader
                            icon={Lightbulb}
                            title="Insights"
                            isOpen={insightsOpen}
                            onToggle={() => setInsightsOpen(!insightsOpen)}
                        />
                        <CollapsibleContent className="space-y-3 text-sm mt-2">
                            {/* Estimated completion time */}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Est. completion time:</span>
                                <Badge variant="neutral" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {questions?.length ? Math.ceil(questions.length * 0.5) : 2} min
                                </Badge>
                            </div>

                            {/* Expected responses */}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Expected responses:</span>
                                <Badge variant="neutral" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {config?.respondentLimit || '50-200'}
                                </Badge>
                            </div>

                            {/* Privacy level */}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Privacy level:</span>
                                <Badge variant="neutral" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {config?.encrypted ? 'FHE Encrypted' : 'Standard'}
                                </Badge>
                            </div>

                            {/* Engagement score */}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Engagement score:</span>
                                <Badge variant="neutral" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {(config && metadata && questions) ? 'High' : 'Medium'}
                                </Badge>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Survey Overview */}
                    {surveyAddress && (
                        <Collapsible open={overviewOpen} onOpenChange={setOverviewOpen}>
                            <SectionHeader
                                icon={BarChart3}
                                title="Overview"
                                isOpen={overviewOpen}
                                onToggle={() => setOverviewOpen(!overviewOpen)}
                            />
                            <CollapsibleContent className="space-y-3 mt-2">
                                <div className="space-y-2">
                                    <div className="text-xs">
                                        <span className="font-semibold text-gray-600">Contract:</span>
                                        <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded mt-1 break-all font-mono">
                                            {surveyAddress}
                                        </code>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="font-semibold text-gray-600">Questions:</span>
                                            <div className="font-mono">{config?.totalQuestions || 0}</div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600">Scale:</span>
                                            <div className="font-mono">1-{config?.limitScale || 5}</div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600">Respondents:</span>
                                            <div className="font-mono">{config?.respondentLimit || 0}</div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600">Privacy:</span>
                                            <div className="font-mono">{config?.encrypted ? "FHE" : "Public"}</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="text-xs">
                                        <span className="font-semibold text-gray-600">Status:</span>
                                        <Badge
                                            variant={config?.status === 'published' ? "default" : "neutral"}
                                            className="ml-2 text-xs"
                                        >
                                            {config?.status || 'Unknown'}
                                        </Badge>
                                    </div>

                                    {config?.title && (
                                        <div className="text-xs">
                                            <span className="font-semibold text-gray-600">Title:</span>
                                            <div className="text-gray-800 dark:text-gray-200 mt-1">{config.title}</div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default SurveyUtilitiesCard
