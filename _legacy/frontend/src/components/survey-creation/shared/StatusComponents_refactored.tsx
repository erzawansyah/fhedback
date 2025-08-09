"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    Loader2,
    Clock,
    Copy,
    ExternalLink
} from "lucide-react"
import { cn } from "@/lib/shadcn/utils"
import {
    StatusIndicatorProps,
    StatusBadgeProps,
    StatusAlertProps,
    ContractAddressProps,
    ProgressStepProps,
    LoadingStateProps,
    ErrorStateProps
} from "../types"
import {
    getStatusColors,
    getStatusBadgeColors,
    formatAddress,
    copyToClipboard,
    getExplorerUrl
} from "../utils"

// Status icons mapping
const statusIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
    loading: Loader2,
    pending: Clock
}

// Status indicator component
export function StatusIndicator({ status, size = 'md', className }: StatusIndicatorProps) {
    const Icon = statusIcons[status]
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    }

    return (
        <Icon
            className={cn(
                sizeClasses[size],
                status === 'loading' && 'animate-spin',
                "text-current",
                className
            )}
        />
    )
}

// Status badge component
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
    return (
        <Badge
            className={cn(
                "font-mono text-xs border-2",
                getStatusBadgeColors(status),
                className
            )}
        >
            <StatusIndicator status={status} size="sm" className="mr-1" />
            {children}
        </Badge>
    )
}

// Status alert component
export function StatusAlert({
    type,
    title,
    description,
    action,
    className
}: StatusAlertProps) {
    return (
        <Alert className={cn("border-2", getStatusColors(type), className)}>
            <StatusIndicator status={type} />
            {title && <AlertTitle className="font-mono">{title}</AlertTitle>}
            <AlertDescription className="font-mono">
                {description}
                {action && <div className="mt-2">{action}</div>}
            </AlertDescription>
        </Alert>
    )
}

// Contract address display component
export function ContractAddress({
    address,
    label = "Contract Address",
    showCopy = true,
    showExplorer = true,
    className
}: ContractAddressProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        const success = await copyToClipboard(address)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleExplorer = () => {
        window.open(getExplorerUrl(address), '_blank')
    }

    return (
        <Card className={cn("bg-secondary-background border-2 border-border", className)}>
            <CardContent className="p-3">
                <div className="space-y-2">
                    <p className="text-xs font-mono text-foreground/70">{label}</p>
                    <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded-base border border-border">
                            {formatAddress(address)}
                        </code>
                        <div className="flex gap-1">
                            {showCopy && (
                                <Button
                                    size="sm"
                                    variant="noShadow"
                                    onClick={handleCopy}
                                    className="h-6 w-6 p-0 hover:bg-background"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            )}
                            {showExplorer && (
                                <Button
                                    size="sm"
                                    variant="noShadow"
                                    onClick={handleExplorer}
                                    className="h-6 w-6 p-0 hover:bg-background"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                    {copied && (
                        <p className="text-xs font-mono text-green-600">Copied to clipboard!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Progress steps component
export function ProgressSteps({ steps, className }: ProgressStepProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        step.completed
                            ? "bg-green-100 border-green-500 text-green-700"
                            : step.current
                                ? "bg-blue-100 border-blue-500 text-blue-700"
                                : "bg-gray-100 border-gray-300 text-gray-500"
                    )}>
                        {step.completed ? (
                            <CheckCircle className="w-3 h-3" />
                        ) : (
                            <span className="text-xs font-mono">{index + 1}</span>
                        )}
                    </div>
                    <span className={cn(
                        "text-sm font-mono",
                        step.completed
                            ? "text-green-700"
                            : step.current
                                ? "text-blue-700 font-bold"
                                : "text-foreground/70"
                    )}>
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    )
}

// Loading state component
export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
    return (
        <div className={cn("flex items-center justify-center p-8", className)}>
            <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-main" />
                <p className="text-sm font-mono text-foreground/70">{message}</p>
            </div>
        </div>
    )
}

// Error state component
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
            <XCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm font-mono text-foreground text-center">{message}</p>
            {onRetry && (
                <Button
                    onClick={onRetry}
                    size="sm"
                    variant="neutral"
                    className="font-mono"
                >
                    Try Again
                </Button>
            )}
        </div>
    )
}
