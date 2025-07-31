"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, Rocket, CheckCircle, Eye, Share2, ExternalLink, Clock } from "lucide-react"
import { toast } from "sonner"
import { publishSurvey } from "@/lib/utils/publishSurvey"
import { useSurveySteps } from "@/hooks/useSurveyCreation"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

type PublishStatus = "idle" | "signing" | "publishing" | "verifying" | "success" | "error"

const PublishSurveyCard = () => {
    const { config, steps, surveyAddress, refreshAllSteps } = useSurveyCreationContext()
    const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
    const [txHash, setTxHash] = useState<string | null>(null)
    const {
        handleError,
        handleTxHash,
        handleSign,
        account,
        receipt,
        status: hookStatus
    } = useSurveySteps()

    // Only show when all steps are completed
    const allStepsCompleted = steps.step1 && steps.step2 && steps.step3

    // Effect to sync local state with config status
    useEffect(() => {
        if (config?.status === "published" && publishStatus !== "idle") {
            // Reset local publish status when config shows published
            setPublishStatus("idle")
            setTxHash(null)
        }
    }, [config?.status, publishStatus])

    // Effect to handle transaction receipt and update survey status
    useEffect(() => {
        if (receipt && hookStatus === "success" && publishStatus === "verifying") {
            setPublishStatus("success")
            // Refresh survey data to get updated status
            setTimeout(() => {
                refreshAllSteps()
            }, 1000)
            toast.success("🎉 Survey published successfully! Your survey is now live.")
        }
    }, [receipt, hookStatus, publishStatus, refreshAllSteps])

    // Effect to handle successful publish transition - clear success state once config is updated
    useEffect(() => {
        if ((publishStatus as PublishStatus) === "success" && config?.status === "published") {
            // Give a moment for user to see the success state, then reset
            setTimeout(() => {
                setPublishStatus("idle")
                setTxHash(null)
            }, 2000)
        }
    }, [publishStatus, config?.status])

    if (!allStepsCompleted) {
        return null
    }

    // Copy to clipboard utility
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success(`${label} copied to clipboard!`)
        } catch {
            handleError("Failed to copy to clipboard")
        }
    }

    // Handle survey publication
    const handlePublishSurvey = async () => {
        if (!surveyAddress || !account.address) {
            handleError("Survey address or wallet not available")
            return
        }
        if (config?.encrypted === undefined || config?.encrypted === null) {
            handleError("Survey type is not set")
            return
        }

        try {
            setPublishStatus("signing")
            // Step 1: Sign and verify
            const { isVerified, signature, message } = await handleSign()
            if (!isVerified || !signature || !message) {
                throw new Error("Failed to verify account ownership")
            }

            setPublishStatus("publishing")
            // Step 2: Publish survey
            const txHashResult = await publishSurvey(surveyAddress as `0x${string}`)

            if (txHashResult) {
                setTxHash(txHashResult as string)
                setPublishStatus("verifying")
                handleTxHash(txHashResult as `0x${string}`)
                toast.success("Transaction submitted! Waiting for confirmation...")
            }
        } catch (error) {
            setPublishStatus("error")
            handleError(error instanceof Error ? error.message : "Failed to publish survey")
            // Reset status after a delay
            setTimeout(() => {
                setPublishStatus("idle")
            }, 3000)
        }
    }

    // Get button text and icon based on status
    const getButtonContent = () => {
        switch (publishStatus) {
            case "signing":
                return {
                    icon: <Loader className="w-3 h-3 mr-2 animate-spin" />,
                    text: "Signing...",
                    disabled: true
                }
            case "publishing":
                return {
                    icon: <Loader className="w-3 h-3 mr-2 animate-spin" />,
                    text: "Publishing...",
                    disabled: true
                }
            case "verifying":
                return {
                    icon: <Clock className="w-3 h-3 mr-2 animate-pulse" />,
                    text: "Verifying...",
                    disabled: true
                }
            case "success":
                return {
                    icon: <CheckCircle className="w-3 h-3 mr-2 text-green-500" />,
                    text: "Published!",
                    disabled: true
                }
            case "error":
                return {
                    icon: <Rocket className="w-3 h-3 mr-2" />,
                    text: "Try Again",
                    disabled: false
                }
            default:
                return {
                    icon: <Rocket className="w-3 h-3 mr-2" />,
                    text: "Publish Survey",
                    disabled: false
                }
        }
    }

    const buttonContent = getButtonContent()

    // Determine if survey is already published based on config status
    const isPublished = config?.status === "published"

    // Show publish interface if not published and not in success state from recent publish
    const shouldShowPublishInterface = !isPublished && (publishStatus as PublishStatus) !== "success"

    // Survey not yet published - show publish button  
    if (shouldShowPublishInterface) {
        return (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <Rocket className="w-5 h-5" />
                        Ready to Publish!
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                    <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                        Your survey is complete and ready to be published. Once published, respondents can start filling it out.
                    </p>
                    <div className="space-y-2">
                        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-2 rounded-md">
                            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-0.5">
                                ⚠️ Important Notice
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 leading-tight">
                                Once published, survey settings and questions cannot be modified. Please review everything carefully before publishing.
                            </p>
                        </div>
                        {publishStatus === "error" && (
                            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-2 rounded-md">
                                <p className="text-xs text-red-800 dark:text-red-200 font-medium mb-0.5">
                                    ❌ Publishing Failed
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-300 leading-tight">
                                    Please try again. Make sure your wallet is connected and you have sufficient funds.
                                </p>
                            </div>
                        )}
                        {publishStatus === "verifying" && txHash && (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-2 rounded-md">
                                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-0.5">
                                    ⏳ Transaction Processing
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
                                    Your transaction is being processed. This may take a few moments.
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono break-all">
                                    TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                </p>
                            </div>
                        )}
                        {(publishStatus as PublishStatus) === "success" && (
                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-2 rounded-md">
                                <p className="text-xs text-green-800 dark:text-green-200 font-medium mb-0.5">
                                    ✅ Successfully Published!
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 leading-tight">
                                    Your survey is now live and accepting responses. You&apos;ll be redirected shortly.
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={handlePublishSurvey}
                            disabled={buttonContent.disabled}
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-auto p-2 disabled:opacity-60"
                        >
                            {buttonContent.icon}
                            <span className="text-xs">{buttonContent.text}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Survey already published - show success message and actions
    return (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <CheckCircle className="w-5 h-5" />
                    Survey Published! 🎉
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Your survey is now live and accepting responses!
                </p>
                <div className="space-y-2">
                    <Button
                        variant="neutral"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(`/view/${surveyAddress}`, '_blank')}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Live Survey
                        <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                    <Button
                        variant="neutral"
                        size="sm"
                        className="w-full"
                        onClick={() => copyToClipboard(`${window.location.origin}/view/${surveyAddress}`, "Survey URL")}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Survey
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default PublishSurveyCard
