"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useCallback, useEffect } from "react"
import { createSurvey } from "@/lib/utils/createSurvey"
import { surveySettingsSchema, SurveySettingsType } from "./formSchema"

import { toast } from "sonner"
import { Wallet, Settings, Info, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSurveySteps } from "@/hooks/use-survey-creation"
import { SurveyCreationStatus } from "@/types/survey-creation"

export const SurveySettingsStep: React.FC = () => {
    // Survey creation context
    const { steps, setSurveyAddress } = useSurveyCreationContext()

    // State for transaction hash and creation process
    const {
        status,
        receipt,
        handleError,
        handleStatus,
        handleTxHash,
        handleSign,
        resetStatus,
    } = useSurveySteps()

    const disabled = steps.step1 || status === "success" || status === "loading" || status === "verifying" || status === "signing"

    /**
     * Callback to set survey address when contract is deployed
     * This will trigger the context to fetch survey data from blockchain
     */
    const setAddress = useCallback((address: `0x${string}` | undefined) => {
        if (address) {
            setSurveyAddress(address)
        }
    }, [setSurveyAddress])

    /**
     * Effect to set initial state based on existing survey configuration
     * If survey already exists, maintain success state to keep form disabled
     * If steps are reset, reset the status back to idle
     */
    useEffect(() => {
        if (steps.step1 && status === "idle") {
            handleStatus("success")
        } else if (!steps.step1 && (status === "success" || status === "error")) {
            // Reset status when steps are reset (resetSteps is called)
            resetStatus()
        }
    }, [steps.step1, status, handleStatus, resetStatus])

    /**
     * Effect to handle transaction receipt and extract contract address
     * When transaction is successful, extract deployed contract address from logs
     */
    useEffect(() => {
        if (receipt && status === "success") {
            // Extract contract address from transaction logs
            const contractAddress = receipt.logs?.[0]?.address || undefined
            if (contractAddress) {
                setAddress(contractAddress)
                toast.success("Survey created successfully! Contract address: " + contractAddress)
                // Status will remain "success" and address will be set, making form non-editable
            } else {
                handleStatus("error")
                handleError("Failed to retrieve contract address from transaction receipt.")
            }
        }
    }, [handleError, handleStatus, receipt, setAddress, status])

    /**
     * Handle form submission for creating survey on blockchain
     * This function will:
     * 1. Verify wallet connection
     * 2. Request user signature for verification
     * 3. Deploy survey contract to blockchain
     * 4. Monitor transaction status
     */
    const onSubmit = async (data: SurveySettingsType) => {
        try {
            // Step 1: Verify wallet ownership by requesting signature
            await handleSign()

            // Step 3: Deploy survey contract to blockchain
            const hash = await createSurvey(data)
            if (hash) {
                handleTxHash(hash)
                toast.success("Transaction sent! Waiting for confirmation... " + hash)
            } else {
                throw new Error("Failed to create survey. Please try again.")
            }
        } catch (error) {
            handleError(error instanceof Error ? error.message : "Unknown error")
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Step 1: Survey Settings
                </CardTitle>
                <p className="text-sm text-gray-600">
                    This is the first step. You will be asked to confirm in your wallet, and the entered data cannot be changed after this process.
                </p>
            </CardHeader>

            <CardContent>
                <SurveyFormComponents
                    disabled={disabled}
                    status={status}
                    onSubmit={onSubmit}
                />
            </CardContent>
        </Card>
    )
}

// Combined Form Components
const SurveyFormComponents: React.FC<{
    disabled: boolean;
    status: SurveyCreationStatus;
    onSubmit: (data: SurveySettingsType) => void;
}> = ({ disabled, status, onSubmit }) => {
    // Form configuration with validation - moved from main component
    const { config } = useSurveyCreationContext();
    const title = config?.title || "";
    const totalQuestions = config?.totalQuestions || 5;
    const limitScale = config?.limitScale || 5;
    const respondentLimit = config?.respondentLimit || 100;
    const disableFHE = config && config.encrypted === null ? undefined : config ? !config.encrypted : undefined;

    const form = useForm<SurveySettingsType>({
        resolver: zodResolver(surveySettingsSchema),
        defaultValues: {
            title: title,
            totalQuestions: totalQuestions,
            limitScale: limitScale,
            respondentLimit: respondentLimit,
            disableFHE: disableFHE,
        },
    })

    // Effect to sync form values with config data
    useEffect(() => {
        form.reset({
            title: title,
            totalQuestions: totalQuestions,
            limitScale: limitScale,
            respondentLimit: respondentLimit,
            disableFHE: disableFHE,
        })
    }, [title, totalQuestions, limitScale, respondentLimit, disableFHE, form])

    return (
        <>
            {/* Survey Deployment Success Alert */}
            {disabled && config && config.address && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-lg font-semibold">
                        Survey Successfully Deployed
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                        Your survey has been created and deployed on-chain at address:
                        <code className="block bg-gray-100 p-1 rounded mt-1 text-xs break-all">
                            {config.address}
                        </code>
                        You can now proceed to the next step to add metadata and configure further details.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Survey Title Field */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Survey Title *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter survey title"
                                        disabled={disabled}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Survey Configuration Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Questions Field */}
                        <FormField
                            control={form.control}
                            name="totalQuestions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Questions *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="5"
                                            min={1}
                                            max={20}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Scale Limit Field */}
                        <FormField
                            control={form.control}
                            name="limitScale"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating Scale *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="5"
                                            min={2}
                                            max={10}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Respondent Limit Field */}
                        <FormField
                            control={form.control}
                            name="respondentLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Respondent Limit *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            min={1}
                                            max={1000}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            disabled={disabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* FHE Privacy Option */}
                    <FormField
                        control={form.control}
                        name="disableFHE"
                        render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Disable FHE (Fully Homomorphic Encryption)
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                        If disabled, survey responses will be visible to everyone.
                                        When enabled (recommended), FHE keeps all answers private and encrypted,
                                        so only aggregated results are shown.
                                    </p>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        {status !== "success" && (
                            <Button
                                type="submit"
                                className="flex items-center gap-2"
                                disabled={status === "loading" || status === "verifying" || status === "signing"}
                            >
                                {(status === "loading" || status === "signing" || status === "verifying") ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Wallet className="w-4 h-4" />
                                )}
                                {status === "loading" ? "Creating Survey..." :
                                    status === "signing" ? "Signing..." :
                                        status === "verifying" ? "Verifying..." :
                                            status === "error" ? "Error Creating Survey" :
                                                "Sign & Create Survey"
                                }
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </>
    )
}
