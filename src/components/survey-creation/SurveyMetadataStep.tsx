"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useCallback, useEffect, useMemo, useState } from "react"
import { setMetadata } from "@/lib/utils/setMetadata"
import { surveyMetadataSchema, SurveyMetadataType } from "./formSchema"

import { toast } from "sonner"
import { Info, Wallet, Loader, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSurveySteps } from "@/hooks/use-survey-creation"
import { SurveyCreationStatus } from "@/types/survey-creation"

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
                <SurveyMetadataFormComponents
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

// Combined Form Components
const SurveyMetadataFormComponents: React.FC<{
    disabled: boolean
    status: SurveyCreationStatus
    isCompleted: boolean
    isEditing: boolean
    onSubmit: (data: SurveyMetadataType) => void
    onEdit: () => void
    onCancelEdit: () => void
    temporaryValue: SurveyMetadataType | null
}> = ({ disabled, status, isCompleted, isEditing, onSubmit, onEdit, onCancelEdit, temporaryValue }) => {
    const { config, metadata, steps } = useSurveyCreationContext()
    const title = useMemo(() => metadata?.title || "", [metadata])
    const description = useMemo(() => metadata?.description || "", [metadata])
    const category = useMemo(() => metadata?.categories || "", [metadata])
    const scaleLabels = useMemo(() => ({
        minLabel: metadata?.minLabel || "Strongly Disagree",
        maxLabel: metadata?.maxLabel || "Strongly Agree",
    }), [metadata])
    const tags = useMemo(() => metadata?.tags?.join(", ") || "", [metadata])

    // Form configuration - sync with context data
    const form = useForm<SurveyMetadataType>({
        resolver: zodResolver(surveyMetadataSchema),
        defaultValues: {
            displayTitle: title,
            description: description,
            category: category,
            scaleLabels: {
                minLabel: scaleLabels.minLabel,
                maxLabel: scaleLabels.maxLabel,
            },
            tags: tags,
        },
    })

    // Centralized effect to sync form values with metadata changes
    useEffect(() => {


        const metadataValues = {
            displayTitle: title,
            description: description,
            category: category,
            scaleLabels: {
                minLabel: scaleLabels.minLabel,
                maxLabel: scaleLabels.maxLabel,
            },
            tags: tags,
        }

        // Check if form values differ from metadata values
        const currentFormValues = form.getValues()
        const hasChanges = (
            currentFormValues.displayTitle !== metadataValues.displayTitle ||
            currentFormValues.description !== metadataValues.description ||
            currentFormValues.category !== metadataValues.category ||
            currentFormValues.scaleLabels.minLabel !== metadataValues.scaleLabels.minLabel ||
            currentFormValues.scaleLabels.maxLabel !== metadataValues.scaleLabels.maxLabel ||
            currentFormValues.tags !== metadataValues.tags
        )

        if (hasChanges) {
            form.reset(metadataValues)
        }
    }, [form, title, description, category, scaleLabels.minLabel, scaleLabels.maxLabel, tags, isEditing])

    // Effect to handle cancel edit - ensure form is properly reset
    useEffect(() => {
        if (!isEditing && temporaryValue) {
            // When exiting edit mode, the form will be synced by the main sync effect above
            console.log("Exited edit mode, form will be synced with current metadata")
        }
    }, [isEditing, temporaryValue])

    // Don't render if dependencies not met
    if (!steps.step1) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-600">
                    Please complete Step 1 (Survey Settings) before adding metadata.
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Show success message when completed */}
            {isCompleted && !isEditing && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6">
                    <p className="text-sm text-green-800">
                        ✅ <strong>Metadata configured successfully!</strong>
                        {metadata?.title && ` Title: "${metadata.title}"`}
                    </p>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Display Title Field */}
                    <FormField
                        control={form.control}
                        name="displayTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Title *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter a clear, descriptive title for your survey"
                                        disabled={disabled}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description Field */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide additional context about your survey's purpose and goals"
                                        disabled={disabled}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Category Selection */}
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category for your survey" aria-label={field.value}>
                                                {field.value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "Select a category"}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="market-research">Market Research</SelectItem>
                                        <SelectItem value="customer-feedback">Customer Feedback</SelectItem>
                                        <SelectItem value="employee-satisfaction">Employee Satisfaction</SelectItem>
                                        <SelectItem value="product-development">Product Development</SelectItem>
                                        <SelectItem value="academic-research">Academic Research</SelectItem>
                                        <SelectItem value="social-research">Social Research</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Scale Labels Section */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">
                                Scale Labels (1 to {config?.limitScale || 5})
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Define what the minimum and maximum values mean in your rating scale.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Min Label */}
                            <FormField
                                control={form.control}
                                name="scaleLabels.minLabel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Label for &quot;1&quot;</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Strongly Disagree"
                                                disabled={disabled}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Max Label */}
                            <FormField
                                control={form.control}
                                name="scaleLabels.maxLabel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Label for &quot;{config?.limitScale || 5}&quot;
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Strongly Agree"
                                                disabled={disabled}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Tags Field */}
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter tags separated by commas (e.g., customer, feedback, satisfaction)"
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Form Submission Buttons */}
                    {steps.step3 ? null : (
                        <div className="flex justify-end">
                            {isCompleted && !isEditing ? (
                                // Show edit button when metadata exists and not in editing mode
                                <Button
                                    type="button"
                                    variant="neutral"
                                    className="flex items-center gap-2"
                                    onClick={onEdit}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Metadata
                                </Button>
                            ) : (
                                // Show action buttons when in editing mode or initial creation
                                <div className="flex gap-2">
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            onClick={onCancelEdit}
                                            disabled={status === "loading" || status === "signing" || status === "verifying"}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={disabled || status === "loading" || status === "signing" || status === "verifying"}
                                        className="flex items-center gap-2"
                                    >
                                        {(status === "loading" || status === "signing" || status === "verifying") ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Wallet className="w-4 h-4" />
                                        )}
                                        {status === "loading" ? "Saving..." :
                                            status === "signing" ? "Signing..." :
                                                status === "verifying" ? "Verifying..." :
                                                    isEditing ? "Update Metadata" :
                                                        "Save Metadata"
                                        }
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </Form>
        </>
    )
}
