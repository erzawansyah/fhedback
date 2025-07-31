"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useEffect, useMemo, useRef, useCallback } from "react"
import { surveyMetadataSchema, SurveyMetadataType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { Wallet, Loader, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

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
            <div className="text-center py-8">
                <p className="text-sm text-gray-600">
                    Please complete Step 1 (Survey Settings) before adding metadata.
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Loading State */}
            {isMetadataLoading && (
                <div className="space-y-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-sm text-gray-500 text-center">Loading metadata...</p>
                </div>
            )}

            {/* Show success message when completed */}
            {isCompleted && !isEditing && !isMetadataLoading && (
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
                                        disabled={inputsDisabled}
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
                                        disabled={inputsDisabled}
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={inputsDisabled}>
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
                                                disabled={inputsDisabled}
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
                                                disabled={inputsDisabled}
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
                                            disabled={inputsDisabled}
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
