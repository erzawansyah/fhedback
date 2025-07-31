"use client"

import { Clock, Users, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Address } from "viem"
import { QUESTIONNAIRE_ABIS as abis } from "@/lib/contracts"
import { useReadContracts } from "wagmi"
import { useEffect, useMemo, useState } from "react"
import { getMetadataContent } from "@/lib/utils/getMetadataContent"

// Survey data interface
interface SurveyData {
    // Basic info
    id: string
    title: string
    description: string
    category: string
    tags: string[]

    // Survey config
    totalQuestions: number
    estimatedTime: number
    maxRespondents: number

    // Status & stats
    respondentCount: number
    rewardAmount: number
    averageRating?: number

    // User interaction
    hasAnswered: boolean
}// Default survey state
const createDefaultSurvey = (): SurveyData => ({
    id: "",
    title: "",
    description: "",
    category: "General",
    tags: [],
    totalQuestions: 0,
    estimatedTime: 0,
    maxRespondents: 0,
    respondentCount: 0,
    rewardAmount: 0,
    averageRating: undefined,
    hasAnswered: false
})

// Component props
interface SurveyCardProps {
    address: Address
    type: 0 | 1
    owner: Address
    createdAt: bigint
    onClick?: () => void
}

// Utility functions
const formatTimeAgo = (timestamp: bigint): string => {
    if (!timestamp) return "Unknown"

    try {
        // Convert bigint timestamp to milliseconds
        const date = new Date(Number(timestamp) * 1000)
        if (isNaN(date.getTime())) return "Unknown"

        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) return "Today"
        if (diffInDays === 1) return "Yesterday"
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
        return `${Math.floor(diffInDays / 30)} months ago`
    } catch {
        return "Unknown"
    }
}

const formatAddress = (address: Address): string => {
    if (!address) return "Unknown"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getProgressPercentage = (current: number, max: number): number => {
    if (max === 0) return 0
    return Math.min(Math.round((current / max) * 100), 100)
}

const formatCategory = (categories: string): string => {
    return categories
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .split(" ")
        .map((cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1))
        .join(" ")
}

// Loading skeleton component
const SurveyCardSkeleton = () => (
    <Card className="border border-border bg-background">
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="w-20 h-5 bg-muted rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="w-4/5 h-5 bg-muted rounded animate-pulse"></div>
            <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
            <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
            </div>
        </div>
    </Card>
)

export const SurveyCard = ({ address: contractAddress, type, onClick, owner, createdAt }: SurveyCardProps) => {
    const [survey, setSurvey] = useState<SurveyData>(createDefaultSurvey())
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    // Contract configuration
    const contracts = useMemo(() => ({
        address: contractAddress,
        abi: type === 0 ? abis.standard : type === 1 ? abis.fhe : abis.general
    }), [contractAddress, type])

    // Contract data fetching
    const { data: contractData, isLoading } = useReadContracts({
        contracts: [
            { ...contracts, functionName: "metadataCID", args: [] },
            { ...contracts, functionName: "status", args: [] },
            { ...contracts, functionName: "questionLimit", args: [] },
            { ...contracts, functionName: "totalQuestions", args: [] },
            { ...contracts, functionName: "respondentLimit", args: [] }
        ],
        query: {
            enabled: !!contractAddress,
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    })

    // Process contract data
    useEffect(() => {
        const processContractData = async () => {
            if (!contractData || contractData.length < 5 || isLoading || isDataLoaded) {
                return
            }

            const [metadata, status, questionLimit, totalQuestions, respondentLimit] = contractData

            // Check for errors
            if ([metadata, status, questionLimit, totalQuestions, respondentLimit].some(item => item?.error)) {
                console.warn("Contract read error for address:", contractAddress)
                return
            }

            // Skip inactive or draft surveys
            if (status?.result === 0 || status?.result === 1) {
                return
            }

            const metadataCID = metadata?.result as string
            if (!metadataCID) {
                console.warn("No metadata CID found for address:", contractAddress)
                return
            }

            try {
                const metadata = await getMetadataContent(metadataCID)
                const questionsCount = Number(totalQuestions?.result) || 0

                setSurvey({
                    id: contractAddress as string,
                    title: metadata.title || "Untitled Survey",
                    description: metadata.description || "No description available",
                    category: metadata.categories ? formatCategory(metadata.categories) : "General",
                    tags: metadata.tags || [],
                    totalQuestions: questionsCount,
                    estimatedTime: Math.ceil(questionsCount * 1.5), // 1.5 min per question
                    maxRespondents: Number(respondentLimit?.result) || 0,
                    respondentCount: 0, // TODO: Get from contract
                    rewardAmount: 0, // TODO: Get from contract
                    averageRating: undefined, // TODO: Get from contract
                    hasAnswered: false // TODO: Check user's response
                })

                setIsDataLoaded(true)
            } catch (error) {
                console.error("Error fetching metadata for address:", contractAddress, error)
            }
        }

        processContractData()
    }, [contractData, contractAddress, isLoading, isDataLoaded])

    // Show loading state
    if (isLoading || !isDataLoaded) {
        return <SurveyCardSkeleton />
    }

    // Main card render
    return (
        <Card className="border border-border bg-background transition-all duration-200 hover:shadow-shadow cursor-pointer group">
            <div className="p-4">
                {/* Header row - Category, Status, and Time */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-xs font-base bg-muted text-foreground">
                            {survey.category}
                        </Badge>
                        {survey.hasAnswered && (
                            <Badge variant="default" className="text-xs font-base bg-accent text-main-foreground">
                                Completed
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-subtle-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(createdAt)}
                        </span>
                    </div>
                </div>

                {/* Title and description */}
                <div className="mb-3">
                    <h3 className="font-heading text-base group-hover:text-accent transition-colors line-clamp-1 mb-1">
                        {survey.title}
                    </h3>
                    <p className="text-sm text-subtle-foreground line-clamp-2">
                        {survey.description}
                    </p>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-subtle-foreground mb-3">
                    <span className="font-base">by {formatAddress(owner)}</span>
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{survey.totalQuestions}q</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>~{survey.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <Users className="w-3 h-3" />
                        <span>{survey.respondentCount}/{survey.maxRespondents}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="w-full bg-muted rounded-base h-1.5">
                        <div
                            className="bg-accent h-1.5 rounded-base transition-all duration-300"
                            style={{
                                width: `${getProgressPercentage(survey.respondentCount, survey.maxRespondents)}%`
                            }}
                        />
                    </div>
                </div>

                {/* Bottom row - Tags, Reward, Rating, and Action */}
                <div className="flex items-center justify-between">
                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        {survey.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mr-2">
                                {survey.tags.slice(0, 2).map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="text-xs bg-secondary-background text-foreground px-2 py-0.5 rounded-base border border-border"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {survey.tags.length > 2 && (
                                    <span className="text-xs text-subtle-foreground">
                                        +{survey.tags.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reward and rating */}
                    <div className="flex items-center gap-3">
                        {survey.averageRating && (
                            <div className="flex items-center gap-1 text-xs text-subtle-foreground">
                                <Star className="w-3 h-3 fill-warning text-warning" />
                                <span>{survey.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                        <div className="text-xs font-base text-success">
                            {survey.rewardAmount > 0 ? `${survey.rewardAmount}t` : "Free"}
                        </div>

                        {/* Action button */}
                        <Button
                            className="text-xs px-3 py-1 h-auto font-base"
                            variant={survey.hasAnswered ? "neutral" : "default"}
                            disabled={survey.respondentCount >= survey.maxRespondents}
                            onClick={onClick}
                        >
                            {survey.hasAnswered
                                ? "View"
                                : survey.respondentCount >= survey.maxRespondents
                                    ? "Full"
                                    : "Take"
                            }
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
