"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Shield,
    ExternalLink,
    Network,
    Database,
    Info,
    Users,
    Scale
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { ContractAddress, StatusBadge } from "../shared"

// Types for better modularity
interface TechnicalSpec {
    label: string
    value: string | number
    icon: React.ElementType
    description?: string
}

// Modular Info Row Component
const InfoRow: React.FC<{
    label: string
    children: React.ReactNode
    className?: string
}> = ({ label, children, className }) => (
    <div className={cn("flex items-center justify-between", className)}>
        <span className="text-xs font-mono text-foreground/70">{label}:</span>
        <div className="flex items-center gap-1">
            {children}
        </div>
    </div>
)

// Modular Technical Spec Component
const TechSpec: React.FC<TechnicalSpec> = ({ label, value, icon: Icon, description }) => (
    <div className={cn(
        "p-3 rounded-base bg-secondary-background border-2 border-border",
        "flex items-center justify-between gap-3"
    )}>
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-main" />
            <div>
                <span className="text-sm font-mono text-foreground">{label}</span>
                {description && (
                    <p className="text-xs font-mono text-foreground/60">{description}</p>
                )}
            </div>
        </div>
        <Badge variant="neutral" className="font-mono text-xs">
            {value}
        </Badge>
    </div>
)

const TechnicalInfoCard: React.FC = () => {
    const { config, metadata, surveyAddress } = useSurveyCreationContext()
    const [detailsOpen, setDetailsOpen] = React.useState(false)

    // Only show if survey is deployed
    if (!surveyAddress) {
        return null
    }

    // Open explorer
    const openExplorer = () => {
        // This would need to be configured for the specific blockchain
        window.open(`https://explorer.zama.ai/address/${surveyAddress}`, '_blank')
    }

    // Technical specifications data
    const techSpecs: TechnicalSpec[] = [
        {
            label: "Network",
            value: "Zama Testnet",
            icon: Network,
            description: "FHE-enabled blockchain"
        },
        {
            label: "Encryption",
            value: config?.encrypted ? "FHE Enabled" : "Standard",
            icon: Shield,
            description: "Fully Homomorphic Encryption"
        },
        {
            label: "Questions",
            value: config?.totalQuestions || 0,
            icon: Scale,
            description: "Total survey questions"
        },
        {
            label: "Scale Range",
            value: `1-${config?.limitScale || 5}`,
            icon: Scale,
            description: "Rating scale range"
        },
        {
            label: "Max Responses",
            value: config?.respondentLimit || 0,
            icon: Users,
            description: "Maximum respondents"
        }
    ]

    return (
        <Card className="bg-background border-2 border-border shadow-shadow">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                    <Database className="w-5 h-5 text-main" />
                    Technical Details
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                {/* Quick Overview */}
                <div className="space-y-2">
                    <InfoRow label="Network">
                        <StatusBadge status="success">Zama Testnet</StatusBadge>
                    </InfoRow>

                    <InfoRow label="Encryption">
                        <StatusBadge
                            status={config?.encrypted ? "success" : "warning"}
                        >
                            {config?.encrypted ? "FHE" : "Standard"}
                        </StatusBadge>
                    </InfoRow>
                </div>

                <Separator className="bg-border" />

                {/* Contract Address */}
                <ContractAddress
                    address={surveyAddress}
                    showCopy={true}
                    showExplorer={false}
                />

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Button
                        variant="neutral"
                        size="sm"
                        className="w-full"
                        onClick={openExplorer}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                    </Button>

                    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="reverse" size="sm" className="w-full">
                                <Info className="w-4 h-4 mr-2" />
                                View Full Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-background border-2 border-border">
                            <DialogHeader>
                                <DialogTitle className="text-foreground font-mono">
                                    Survey Technical Specifications
                                </DialogTitle>
                                <DialogDescription className="text-foreground/70 font-mono">
                                    Complete technical details and configuration for your survey
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Contract Information */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-mono text-foreground font-bold">
                                        Contract Information
                                    </h4>
                                    <ContractAddress
                                        address={surveyAddress}
                                        showCopy={true}
                                        showExplorer={true}
                                    />
                                </div>

                                <Separator className="bg-border" />

                                {/* Technical Specifications */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-mono text-foreground font-bold">
                                        Specifications
                                    </h4>
                                    <div className="grid gap-3">
                                        {techSpecs.map((spec, index) => (
                                            <TechSpec key={index} {...spec} />
                                        ))}
                                    </div>
                                </div>

                                {/* Survey Metadata */}
                                {metadata && (
                                    <>
                                        <Separator className="bg-border" />
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-mono text-foreground font-bold">
                                                Survey Information
                                            </h4>
                                            <div className={cn(
                                                "p-3 rounded-base bg-secondary-background border-2 border-border",
                                                "space-y-2"
                                            )}>
                                                <InfoRow label="Title">
                                                    <span className="text-sm font-mono text-foreground">
                                                        {metadata.title || 'Untitled Survey'}
                                                    </span>
                                                </InfoRow>
                                                {metadata.categories && (
                                                    <InfoRow label="Category">
                                                        <Badge variant="neutral" className="font-mono text-xs">
                                                            {metadata.categories.split("-").map((word) =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(" ")}
                                                        </Badge>
                                                    </InfoRow>
                                                )}
                                                {metadata.tags && metadata.tags.length > 0 && (
                                                    <InfoRow label="Tags">
                                                        <div className="flex flex-wrap gap-1">
                                                            {metadata.tags.slice(0, 3).map((tag, index) => (
                                                                <Badge key={index} variant="neutral" className="font-mono text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {metadata.tags.length > 3 && (
                                                                <Badge variant="neutral" className="font-mono text-xs">
                                                                    +{metadata.tags.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </InfoRow>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}

export default TechnicalInfoCard
