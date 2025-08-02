"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useEffect, useMemo, useRef, useCallback } from "react"
import { surveyMetadataSchema, SurveyMetadataType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { Wallet, Loader, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
    TextField,
    TextareaField,
    SelectField,
    FormSection,
    FormGrid,
    StatusAlert,
    LoadingState
} from "./shared"

// Category options for better maintainability
const CATEGORY_OPTIONS = [
    { value: "market-research", label: "Market Research" },
    { value: "customer-feedback", label: "Customer Feedback" },
    { value: "employee-satisfaction", label: "Employee Satisfaction" },
    { value: "product-development", label: "Product Development" },
    { value: "academic-research", label: "Academic Research" },
    { value: "social-research", label: "Social Research" },
    { value: "other", label: "Other" }
]

interface SurveyMetadataFormProps {
    disabled: boolean
    status: SurveyCreationStatus
    isCompleted: boolean
    isEditing: boolean
    onSubmit: (data: SurveyMetadataType) => void
    onEdit: () => void
    onCancelEdit: () => void
    temporaryValue: SurveyMetadataType | null
}

export const SurveyMetadataForm: React.FC<SurveyMetadataFormProps> = ({
    disabled,
    status,
    isCompleted,
    isEditing,
    onSubmit,
    onEdit,
    onCancelEdit,
    temporaryValue
}) => {
    const { config, metadata, steps, surveyAddress, isLoading } = useSurveyCreationContext()

    // Memoize metadata values to prevent unnecessary re-computations
    const title = useMemo(() => metadata?.title || "", [metadata?.title])
    const description = useMemo(() => metadata?.description || "", [metadata?.description])
    const category = useMemo(() => metadata?.categories || "", [metadata?.categories])
    const scaleLabels = useMemo(() => ({
        minLabel: metadata?.minLabel || "Strongly Disagree",
        maxLabel: metadata?.maxLabel || "Strongly Agree",
    }), [metadata?.minLabel, metadata?.maxLabel])
    const tags = useMemo(() => metadata?.tags?.join(", ") || "", [metadata?.tags])

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

    // Determine if inputs should be disabled
    const isMetadataLoading = !!surveyAddress && isLoading && !metadata;
    const inputsDisabled = disabled || isMetadataLoading;

    // Use ref to track if form has been initialized to prevent loops
    const formInitialized = useRef(false);
    const lastMetadata = useRef<string>("");
    const formRef = useRef(form);

    // Update form ref when form changes
    useEffect(() => {
        formRef.current = form;
    });

    // Build metadata signature to detect changes
    const metadataSignature = `${title}-${description}-${category}-${scaleLabels.minLabel}-${scaleLabels.maxLabel}-${tags}`;

    // Create stable reset function
    const resetFormWithMetadata = useCallback(() => {
        const currentSignature = `${title}-${description}-${category}-${scaleLabels.minLabel}-${scaleLabels.maxLabel}-${tags}`;

        const metadataValues = {
            displayTitle: title,
            description: description,
            category: category,
            scaleLabels: {
                minLabel: scaleLabels.minLabel,
                maxLabel: scaleLabels.maxLabel,
            },
            tags: tags,
        };

        formRef.current.reset(metadataValues);
        lastMetadata.current = currentSignature;
        formInitialized.current = true;
    }, [title, description, category, scaleLabels.minLabel, scaleLabels.maxLabel, tags]);

    // Use useEffect to safely reset form (not during render)
    useEffect(() => {
        if (!isEditing && metadataSignature !== lastMetadata.current) {
            resetFormWithMetadata();
        }
    }, [metadataSignature, isEditing, resetFormWithMetadata]);

    // Effect to handle cancel edit mode
    useEffect(() => {
        if (!isEditing && temporaryValue) {
            // When exiting edit mode, the form will be synced by the main sync effect above
            console.log("Exited edit mode, form will be synced with current metadata")
        }
    }, [isEditing, temporaryValue])

    // Don't render if dependencies not met
    if (!steps.step1) {
        return (
            <StatusAlert
                type="info"
                title="Prerequisites Required"
                description="Please complete Step 1 (Survey Settings) before adding metadata."
            />
        )
    }

    // Loading state
    if (isMetadataLoading) {
        return <LoadingState message="Loading metadata..." />
    }

    return (
        <>
            {/* Success message when completed */}
            {isCompleted && !isEditing && (
                <StatusAlert
                    type="success"
                    title="Metadata Configured Successfully!"
                    description={`${metadata?.title ? `Title: "${metadata.title}"` : 'Your survey metadata has been set up.'}`}
                    className="mb-6"
                />
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information Section */}
                    <FormSection
                        title="Basic Information"
                        description="Provide essential details about your survey"
                    >
                        <TextField
                            control={form.control}
                            name="displayTitle"
                            label="Display Title *"
                            placeholder="Enter a clear, descriptive title for your survey"
                            disabled={inputsDisabled}
                        />

                        <TextareaField
                            control={form.control}
                            name="description"
                            label="Description"
                            placeholder="Provide additional context about your survey's purpose and goals"
                            disabled={inputsDisabled}
                            rows={3}
                        />

                        <SelectField
                            control={form.control}
                            name="category"
                            label="Category *"
                            placeholder="Select a category for your survey"
                            options={CATEGORY_OPTIONS}
                            disabled={inputsDisabled}
                        />
                    </FormSection>

                    {/* Scale Configuration Section */}
                    <FormSection
                        title={`Scale Labels (1 to ${config?.limitScale || 5})`}
                        description="Define what the minimum and maximum values mean in your rating scale"
                    >
                        <FormGrid columns={2}>
                            <TextField
                                control={form.control}
                                name={"scaleLabels.minLabel" as keyof SurveyMetadataType}
                                label={`Label for "1"`}
                                placeholder="e.g., Strongly Disagree"
                                disabled={inputsDisabled}
                            />

                            <TextField
                                control={form.control}
                                name={"scaleLabels.maxLabel" as keyof SurveyMetadataType}
                                label={`Label for "${config?.limitScale || 5}"`}
                                placeholder="e.g., Strongly Agree"
                                disabled={inputsDisabled}
                            />
                        </FormGrid>
                    </FormSection>

                    {/* Additional Information Section */}
                    <FormSection
                        title="Additional Information"
                        description="Add tags to help categorize and organize your survey"
                    >
                        <TextField
                            control={form.control}
                            name="tags"
                            label="Tags"
                            placeholder="Enter tags separated by commas (e.g., customer, feedback, satisfaction)"
                            disabled={inputsDisabled}
                        />
                    </FormSection>

                    {/* Form Action Buttons */}
                    {!steps.step3 && (
                        <div className="flex justify-end pt-4">
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
                                            disabled={disabled}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={disabled}
                                        className="flex items-center gap-2"
                                    >
                                        {status === "loading" ? (
                                            <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Wallet className="w-4 h-4" />
                                        )}
                                        {status === "loading" ? "Saving Metadata..." :
                                            status === "signing" ? "Signing..." :
                                                status === "verifying" ? "Verifying..." :
                                                    status === "error" ? "Error Saving Metadata" :
                                                        isEditing ? "Update Metadata" : "Save Metadata"
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
