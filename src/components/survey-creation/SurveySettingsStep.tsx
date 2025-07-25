"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wallet, Settings, Info, Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "../ui/switch"
import { useSurveyCreation } from "@/context/SurveyCreationContext"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { createSurvey } from "@/lib/utils/createSurvey"
import { signAndVerify } from "@/lib/utils/signMessage"

// Schema untuk pengaturan survey
const surveySettingsSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    totalQuestions: z.number().min(1, "Must have at least 1 question").max(20, "Currently, the maximum is 20 questions"),
    limitScale: z.number().min(2, "Scale must be at least 2").max(10, "Scale maximum is 10"),
    respondentLimit: z.number().min(1, "Must allow at least 1 respondent").max(1000, "Maximum 1,000 respondents"),
    disableFHE: z.boolean().default(false).optional(),
})

export type SurveySettingsData = z.infer<typeof surveySettingsSchema>

type CreateSurveyState = "idle" | "signing" | "loading" | "verifying" | "success" | "error"

export const SurveySettingsStep: React.FC = () => {
    // State for transaction hash and creation process
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
    const [state, setState] = useState<CreateSurveyState>("idle")

    // Wallet and blockchain hooks
    const account = useAccount()
    const { data: receipt } = useWaitForTransactionReceipt({
        hash: txHash ? txHash : undefined,
    })

    // Survey creation context
    const { setSurveyAddress, config } = useSurveyCreation()

    // Form configuration with validation
    const form = useForm<SurveySettingsData>({
        resolver: zodResolver(surveySettingsSchema),
        defaultValues: {
            title: config.title || "",
            totalQuestions: config.totalQuestions || 5,
            limitScale: config.limitScale || 5,
            respondentLimit: config.respondentLimit || 100,
            disableFHE: !config.isFhe || false, // Fixed: disableFHE should be opposite of isFhe
        },
    })

    // Determine if form should be editable
    const editable = config.address === null || state === "error" || state === "idle"

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
     * If survey already exists, set state to success
     */
    useEffect(() => {
        if (config.address) {
            setState("success")
        } else {
            setState("idle")
        }
    }, [config.address])

    /**
     * Effect to sync form values with context data
     * Updates form whenever config data changes from blockchain
     */
    useEffect(() => {
        // Update form values when config data changes
        form.reset({
            title: config.title || "",
            totalQuestions: config.totalQuestions || 5,
            limitScale: config.limitScale || 5,
            respondentLimit: config.respondentLimit || 100,
            disableFHE: !config.isFhe || false, // disableFHE is opposite of isFhe
        })
    }, [config.title, config.totalQuestions, config.limitScale, config.respondentLimit, config.isFhe, form])

    /**
     * Effect to handle transaction receipt and extract contract address
     * When transaction is successful, extract deployed contract address from logs
     */
    useEffect(() => {
        if (receipt && receipt.status === "success") {
            // Extract contract address from transaction logs
            const contractAddress = receipt.logs?.[0]?.address || undefined
            if (contractAddress) {
                setState("success")
                setAddress(contractAddress)
                toast.success("Survey created successfully! Contract address: " + contractAddress)
            } else {
                setState("error")
                toast.error("Failed to retrieve contract address from transaction receipt.")
            }
        } else if (receipt && receipt.status === "reverted") {
            setState("error")
            toast.error("Transaction was reverted. Please try again.")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt, txHash])

    /**
     * Handle form submission for creating survey on blockchain
     * This function will:
     * 1. Verify wallet connection
     * 2. Request user signature for verification
     * 3. Deploy survey contract to blockchain
     * 4. Monitor transaction status
     */
    const onSubmit = async (data: SurveySettingsData) => {
        // Check wallet connection first
        if (!account.address) {
            toast.error("Please connect your wallet to create a survey.")
            return
        }

        // Reset transaction hash and set signing state
        setState("signing")
        setTxHash(null)

        try {
            // Step 1: Verify wallet ownership by requesting signature
            const isVerified = await signAndVerify(account.address as `0x${string}`)
            if (!isVerified) {
                setState("error")
                throw new Error("Signature verification failed")
            }

            // Step 2: Set loading state and deploy contract
            setState("loading")
        } catch (error) {
            setState("error")
            toast.error("Failed to sign message. Please try again. " + (error instanceof Error ? error.message : ""))
            return
        }

        try {
            // Step 3: Deploy survey contract to blockchain
            const hash = await createSurvey(data)
            if (hash) {
                setTxHash(hash)
                setState("verifying")
                toast.success("Transaction sent! Waiting for confirmation... " + hash)
            } else {
                setState("error")
                toast.error("Failed to create survey. Please try again.")
            }
        } catch (error) {
            setState("error")
            toast.error("Error creating survey: " + (error instanceof Error ? error.message : "Unknown error"))
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
                {/* Survey Deployment Success Alert */}
                {!editable && config.address && (
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
                                            disabled={!editable}
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
                                                disabled={!editable}
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
                                                disabled={!editable}
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
                                                disabled={!editable}
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
                                            disabled={!editable}
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
                            {editable && (
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2"
                                    disabled={state === "loading" || state === "verifying" || state === "signing"}
                                >
                                    {(state === "loading" || state === "signing" || state === "verifying") ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Wallet className="w-4 h-4" />
                                    )}
                                    {state === "loading" ? "Creating Survey..." :
                                        state === "signing" ? "Signing..." :
                                            state === "verifying" ? "Verifying..." :
                                                state === "success" ? "Survey Created!" :
                                                    state === "error" ? "Error Creating Survey" :
                                                        "Sign & Create Survey"
                                    }
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
