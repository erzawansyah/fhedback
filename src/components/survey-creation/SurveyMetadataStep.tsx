"use client"

import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useCallback, useEffect, useState } from "react"
import { setMetadata } from "@/lib/utils/setMetadata"
import { SurveyMetadataType } from "./formSchema"
import { SurveyMetadataForm } from "./SurveyMetadataForm"

import { toast } from "sonner"
import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSurveySteps } from "@/hooks/useSurveyCreation"

/**
 * SurveyMetadataStep Component
 * Handles the second step of survey creation where users can add metadata
 * such as title, description, category, scale labels, and tags
 */
export const SurveyMetadataStep: React.FC = () => {
    // Get survey creation context
    const { config, steps, setMetadataCid, metadata } = useSurveyCreationContext()
    const contractAddress = config?.address as `0x${string}` | null

    // Use consistent state management hook like SurveySettingsStep
    const {
        status,
        receipt,
        handleError,
        handleStatus,
        handleTxHash,
        handleSign,
        account,
    } = useSurveySteps()

    // Local state for editing mode
    const [isEditing, setIsEditing] = useState(false)
    const [temporaryValue, setTemporaryValue] = useState<SurveyMetadataType | null>(null)

    // Determine if form should be disabled
    const isCompleted = steps.step2
    const canEdit = steps.step1 && !isCompleted
    const disabled = steps.step3 || !canEdit && !isEditing || status === "loading" || status === "signing" || status === "verifying"

    /**
     * Effect to set completed status when metadata exists
     */
    useEffect(() => {
        if (steps.step2 && status === "idle" && metadata?.metadataCid && temporaryValue === null) {
            handleStatus("success")
        }
    }, [steps.step2, status, handleStatus, metadata?.metadataCid, temporaryValue])

    /**
     * Handle edit mode activation
     */
    const activateEditMode = useCallback(() => {
        // Only activate edit mode if survey is completed
        if (isCompleted && temporaryValue === null) {
            // Save original values before editing
            setTemporaryValue({
                displayTitle: metadata?.title || "",
                description: metadata?.description || "",
                category: metadata?.categories || "",
                scaleLabels: {
                    minLabel: metadata?.minLabel || "Strongly Disagree",
                    maxLabel: metadata?.maxLabel || "Strongly Agree",
                },
                tags: metadata?.tags?.join(", ") || "",
            })
            setIsEditing(true)
            handleStatus("idle")
        }
    }, [isCompleted, handleStatus, metadata, temporaryValue])

    /**
     * Handle edit mode cancellation
     */
    const cancelEditMode = useCallback(() => {
        if (isEditing && temporaryValue) {
            setIsEditing(false)
            setTemporaryValue(null)
            handleStatus("success")
        }
    }, [isEditing, temporaryValue, handleStatus])

    /**
     * Handle form submission
     */
    const onSubmit = async (data: SurveyMetadataType) => {
        try {
            // Step 1: Sign and verify
            const { isVerified, signature, message } = await handleSign()
            if (!isVerified || !signature || !message) {
                throw new Error("Failed to verify account ownership")
            }

            // Step 2: Prepare and submit metadata
            const preparedData = {
                address: account.address as `0x${string}`,
                signature,
                message,
                data: {
                    title: data.displayTitle,
                    description: data.description || "",
                    categories: data.category,
                    minLabel: data.scaleLabels.minLabel,
                    maxLabel: data.scaleLabels.maxLabel,
                    tags: data.tags?.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) || [],
                },
            }

            const txHash = await setMetadata(contractAddress!, preparedData)
            if (txHash) {
                handleTxHash(txHash)
                toast.success("Transaction sent! Waiting for confirmation...")
            } else {
                throw new Error("Failed to get transaction hash")
            }
        } catch (error) {
            // If in editing mode and error occurs, trigger cancel edit
            if (isEditing && temporaryValue) {
                cancelEditMode()
            }
            handleError(error instanceof Error ? error.message : "Unknown error")
        }
    }

    /**
       * Effect to handle transaction receipt and extract metadata CID
       */
    useEffect(() => {
        if (receipt && status === "success" && contractAddress && !isEditing) {
            setMetadataCid()
        } else if (receipt && status === "success" && contractAddress && isEditing) {
            // For edit mode, also update the metadata CID but don't change step status
            setMetadataCid()
            setIsEditing(false)
            setTemporaryValue(null)
        } else {
            if (receipt) {
                setIsEditing(false)
                setTemporaryValue(null)
            }
        }
    }, [status, receipt, contractAddress, setMetadataCid, isEditing, handleError])


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Step 2: Survey Metadata
                    {isCompleted && (
                        <span className="text-sm font-normal text-green-600">(Configured)</span>
                    )}
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Add title, description, category, and other metadata for your survey.
                </p>
            </CardHeader>
            <CardContent>
                <SurveyMetadataForm
                    disabled={disabled}
                    status={status}
                    isCompleted={isCompleted}
                    isEditing={isEditing}
                    onSubmit={onSubmit}
                    onEdit={activateEditMode}
                    onCancelEdit={cancelEditMode}
                    temporaryValue={temporaryValue}
                />
            </CardContent>
        </Card>
    )
}
