"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, Rocket, CheckCircle, Eye, Share2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { publishSurvey } from "@/lib/utils/publishSurvey"
import { useSurveySteps } from "@/hooks/useSurveyCreation"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"

const PublishSurveyCard = () => {
    const { config, steps } = useSurveyCreationContext()
    const [isPublishing, setIsPublishing] = useState(false)
    const {
        handleError,
        handleTxHash,
        handleSign,
        account
    } = useSurveySteps()

    // Only show when all steps are completed
    const allStepsCompleted = steps.step1 && steps.step2 && steps.step3

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
        if (!config?.address || !account.address) {
            handleError("Survey address or wallet not available")
            return
        }
        if (config?.encrypted === undefined || config?.encrypted === null) {
            handleError("Survey type is not set")
            return
        }

        setIsPublishing(true)
        try {
            // Step 1: Sign and verify
            const { isVerified, signature, message } = await handleSign()
            if (!isVerified || !signature || !message) {
                throw new Error("Failed to verify account ownership")
            }

            // Step 2: Publish survey
            const txHash = await publishSurvey(config.address as `0x${string}`)

            if (txHash) {
                handleTxHash(txHash as `0x${string}`)
                toast.success("Transaction submitted successfully! Waiting for confirmation...")
            }
        } catch (error) {
            handleError(error instanceof Error ? error.message : "Failed to publish survey")
        } finally {
            setIsPublishing(false)
        }
    }

    // Survey not yet published - show publish button
    if (config?.status !== "published") {
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
                        <Button
                            onClick={handlePublishSurvey}
                            disabled={isPublishing}
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 h-auto p-2"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader className="w-3 h-3 mr-2 animate-spin" />
                                    <span className="text-xs">Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-3 h-3 mr-2" />
                                    <span className="text-xs">Publish Survey</span>
                                </>
                            )}
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
                        onClick={() => window.open(`/view/${config.address}`, '_blank')}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Live Survey
                        <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                    <Button
                        variant="neutral"
                        size="sm"
                        className="w-full"
                        onClick={() => copyToClipboard(`${window.location.origin}/view/${config.address}`, "Survey URL")}
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
