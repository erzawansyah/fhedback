"use client"

// Import React hooks for state management and lifecycle
import { useEffect, useState } from "react"
// Import React Hook Form for form handling and validation
import { useForm } from "react-hook-form"
// Import Zod resolver for form validation schema integration
import { zodResolver } from "@hookform/resolvers/zod"
// Import Zod for schema validation
import * as z from "zod"
// Import Lucide React icons for UI elements
import { Info, Wallet, Loader, Pencil } from "lucide-react"

// Import UI components from the design system
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// Import toast notification system
import { toast } from "sonner"
// Import utility functions for blockchain interactions
import { setMetadata } from "@/lib/utils/setMetadata"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { sign } from "@/lib/utils/signMessage"
// Import survey creation context for shared state management
import { useSurveyCreation } from "@/context/SurveyCreationContext"

/**
 * Zod schema for survey metadata validation
 * Defines the structure and validation rules for survey metadata form
 */
const surveyMetadataSchema = z.object({
    // Display title with length constraints
    displayTitle: z.string().min(1, "Display title is required").max(200, "Title must be less than 200 characters"),
    // Optional description with maximum length limit
    description: z.string().max(1000, "Description must be less than 1000 characters").optional().or(z.literal("")),
    // Required category selection
    category: z.string().min(1, "Category is required"),
    // Scale labels object for rating scale endpoints
    scaleLabels: z.object({
        minLabel: z.string().min(1, "Min label is required"),
        maxLabel: z.string().min(1, "Max label is required"),
    }),
    // Optional tags field for categorization
    tags: z.string().optional().or(z.literal("")),
})

// TypeScript type inference from Zod schema for type safety
export type SurveyMetadataData = z.infer<typeof surveyMetadataSchema>

// Submission status type
export type SubmissionStatus = "idle" | "loading" | "signing" | "verifying" | "submitted" | "error" | "editing";

/**
 * SurveyMetadataStep Component
 * Handles the second step of survey creation where users can add metadata
 * such as title, description, category, scale labels, and tags
 */
export const SurveyMetadataStep = () => {
    // Get survey creation context and contract configuration
    const { config, metadata } = useSurveyCreation()
    const contractAddress = config.address as `0x${string}` | null;

    // temporary state for editing mode to store original values
    const [originalValues, setOriginalValues] = useState<SurveyMetadataData | null>(null);

    // Loading state for form submission and transaction processing
    const [status, setStatus] = useState<SubmissionStatus>("idle");

    // State for tracking blockchain transaction hash
    const [txHash, setTxHash] = useState<`0x${string}` | string | null>(null)

    // Hook to monitor transaction receipt status
    const { isSuccess, isError } = useWaitForTransactionReceipt({
        hash: typeof txHash === "string" && txHash.startsWith("0x") ? (txHash as `0x${string}`) : undefined,
        query: {
            enabled: !!txHash && txHash.startsWith("0x"),
            refetchInterval: 5000, // Check every 5 seconds
        },
    })


    // Get connected wallet account information
    const account = useAccount()

    // Determine if form should be disabled (during processing or when not in edit mode and already submitted)
    const isProcessing = status === "loading" || status === "signing" || status === "verifying"
    const isSubmittedAndNotEditing = status === "submitted" && !!config.metadataCid
    const disabled = Boolean(isProcessing || isSubmittedAndNotEditing)

    /**
     * Initialize React Hook Form with Zod validation schema
     * Sets up form handling with default values and validation rules
     */
    const form = useForm<SurveyMetadataData>({
        resolver: zodResolver(surveyMetadataSchema),
        defaultValues: {
            displayTitle: metadata?.title || "",
            description: metadata?.description || "",
            category: metadata?.categories || "",
            scaleLabels: {
                // Default scale labels for Likert-type questions
                minLabel: metadata?.minLabel || "Strongly Disagree",
                maxLabel: metadata?.maxLabel || "Strongly Agree",
            },
            tags: metadata?.tags?.join(", ") || "",
        },
    })

    /**
     * Verify wallet address by requesting user signature
     * This function prompts the user to sign a message to prove wallet ownership
     * @returns Promise<{message: string, signature: string} | null>
     */
    const verifyAddress = async () => {
        try {
            // Check if wallet is connected and has an address
            if (!account.address) {
                throw new Error("Wallet is not connected or address is not available")
            }

            // Request user to sign a verification message
            const { message, signature } = await sign(account.address as `0x${string}`)

            // Validate that signature was successfully created
            if (!signature) {
                throw new Error("Failed to sign verification message")
            }

            return {
                message,
                signature,
            }
        } catch (error) {
            console.error("Error verifying address:", error)
            toast.error(`Failed to verify address: ${error instanceof Error ? error.message : "Unknown error"}`)
            return null
        }
    }

    /**
     * Effect to initialize editing state based on existing metadata
     * If metadata already exists, disable editing initially and reset form values
     */
    useEffect(() => {
        if (config.metadataCid && metadata) {
            setStatus("submitted")
            // Reset form values to match current metadata whenever metadata changes
            const metadataValues = {
                displayTitle: metadata.title || "",
                description: metadata.description || "",
                category: metadata.categories || "",
                scaleLabels: {
                    minLabel: metadata.minLabel || "Strongly Disagree",
                    maxLabel: metadata.maxLabel || "Strongly Agree",
                },
                tags: metadata.tags?.join(", ") || "",
            }
            form.reset(metadataValues)
        } else if (!config.metadataCid) {
            setStatus("idle")
        }
    }, [config.metadataCid, metadata, form])

    /**
     * Effect hook to handle transaction status changes
     * Monitors blockchain transaction receipt and provides user feedback
     */
    useEffect(() => {
        if (isSuccess && txHash) {
            // Transaction was successful - show success message and refresh data
            setStatus("submitted")
            setTxHash(null)
            // Clear original values after successful save
            setOriginalValues(null)
            toast.success("Transaction confirmed! Metadata saved successfully.")
        } else if (isError && txHash) {
            // Transaction failed - show error message and reset state
            setStatus("error")
            setTxHash(null)
            toast.error("Transaction failed. Please try again.")
        }
    }, [isSuccess, isError, txHash])


    // handle editing state
    // Activate edit mode and store original values for potential cancellation
    const activateEditMode = () => {
        if (status === "submitted") {
            // Store current form values as original values before allowing edits
            setOriginalValues({
                displayTitle: form.getValues("displayTitle"),
                description: form.getValues("description"),
                category: form.getValues("category"),
                scaleLabels: {
                    minLabel: form.getValues("scaleLabels.minLabel"),
                    maxLabel: form.getValues("scaleLabels.maxLabel"),
                },
                tags: form.getValues("tags"),
            })
            setStatus("editing")
        }
    }

    const cancelEditMode = () => {
        if (status === "editing" && originalValues) {
            // Reset form to original values
            form.reset(originalValues)
            setStatus("submitted")
            setOriginalValues(null)
        }
    }



    /**
     * Handle form submission for survey metadata
     * This function processes the form data and submits it to the blockchain
     * @param data - Validated form data containing survey metadata
     */

    const onSubmit = async (data: SurveyMetadataData) => {
        // Check if wallet is connected
        if (!account.address) {
            toast.error("Please connect your wallet to save metadata.")
            return
        }

        // Ensure contract address is available before proceeding
        if (!contractAddress) {
            toast.error("Survey contract address is not set.")
            return
        }

        // Start the signing process
        setStatus("signing")

        try {
            // Step 1: Verify wallet ownership by requesting signature
            const verifyResult = await verifyAddress()
            if (!verifyResult || !verifyResult.message || !verifyResult.signature) {
                setStatus("error")
                toast.error("Failed to verify address. Please try again.")
                return
            }

            // Extract verification data
            const { message, signature: hash } = verifyResult

            // Step 2: Prepare metadata for blockchain submission
            setStatus("loading")
            const preparedData = {
                address: account.address as `0x${string}`,
                signature: hash,
                message: message,
                data: {
                    title: data.displayTitle,
                    description: data.description || "",
                    categories: data.category,
                    minLabel: data.scaleLabels.minLabel,
                    maxLabel: data.scaleLabels.maxLabel,
                    // Parse tags from comma-separated string to array
                    tags: data.tags?.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) || [],
                },
            }

            // Step 3: Submit metadata to blockchain via smart contract
            const txHashResult = await setMetadata(contractAddress, preparedData)

            if (txHashResult) {
                // Store transaction hash for monitoring
                setTxHash(txHashResult)
                setStatus("verifying")
                toast.success("Transaction sent! Waiting for confirmation...")
            } else {
                throw new Error("Failed to get transaction hash")
            }
        } catch (error) {
            // If there was an error and we're in editing mode, reset to original values
            if (status === "editing" && originalValues) {
                cancelEditMode()
            } else {
                setStatus("error")
            }
            toast.error(`Failed to save survey metadata: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }

    // Render the survey metadata form component
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Step 2: Survey Metadata
                    {config.metadataCid && (
                        <span className="text-sm font-normal text-green-600">(Configured)</span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Display Title Field - Required field for survey identification */}
                        <FormField
                            control={form.control}
                            name="displayTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Title *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="How users will see your survey title"
                                            {...field}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description Field - Optional textarea for survey description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what your survey is about..."
                                            className="min-h-[100px]"
                                            {...field}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Selection - Required dropdown for survey categorization */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" aria-label={field.value}>
                                                    {(field.value ? field.value.charAt(0).toUpperCase() + field.value.slice(1) : "Select Category")}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Predefined category options for survey classification */}
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="entertainment">Entertainment</SelectItem>
                                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="research">Research</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Scale Labels Section - Define rating scale endpoints */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Scale Labels (1 to {config.limitScale ? config.limitScale : 5})</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Define what the minimum and maximum values mean in your rating scale.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Minimum Scale Label - Label for the lowest rating (1) */}
                                <FormField
                                    control={form.control}
                                    name="scaleLabels.minLabel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Label for &quot;1&quot;</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Strongly Disagree"
                                                    {...field}
                                                    disabled={disabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Maximum Scale Label - Label for the highest rating (5) */}
                                <FormField
                                    control={form.control}
                                    name="scaleLabels.maxLabel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Label for &quot;{config.limitScale ? config.limitScale : 5}&quot;</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Strongly Agree"
                                                    {...field}
                                                    disabled={disabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Tags Field - Optional comma-separated tags for survey categorization */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Add tags (comma separated)"
                                                {...field}
                                                disabled={disabled}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Submission Buttons */}
                        <div className="flex justify-end">
                            {status === "submitted" && config.metadataCid ? (
                                // Show edit button when metadata exists and not in editing mode
                                <Button
                                    type="button"
                                    variant="neutral"
                                    className="flex items-center gap-2"
                                    onClick={activateEditMode}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Metadata
                                </Button>
                            ) : (
                                // Show action buttons when in editing mode or initial creation
                                <div className="flex gap-2">
                                    {status === "editing" && (
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            onClick={cancelEditMode}
                                            disabled={disabled}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={disabled}
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
                                                    status === "editing" ? "Update Metadata" :
                                                        config.metadataCid ? "Update Metadata" : "Save Metadata"
                                        }
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
