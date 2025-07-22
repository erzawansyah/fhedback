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
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
    const [state, setState] = useState<CreateSurveyState>("idle")
    const account = useAccount()
    const { data: receipt } = useWaitForTransactionReceipt({
        hash: txHash ? txHash : undefined,
    })
    const { setSurveyAddress, config } = useSurveyCreation()
    const form = useForm<SurveySettingsData>({
        resolver: zodResolver(surveySettingsSchema),
        defaultValues: {
            title: config.title || "",
            totalQuestions: config.totalQuestions || 5,
            limitScale: config.limitScale || 5,
            respondentLimit: config.respondentLimit || 100,
            disableFHE: !!config.isFhe || false,
        },
    })
    const editable = config.address === null || state === "error" || state === "idle"

    const setAddress = useCallback((address: `0x${string}` | undefined) => {
        if (address) {
            setSurveyAddress(address)
        }
    }, [setSurveyAddress])

    useEffect(() => {
        if (config.address) {
            setState("success")
        } else {
            setState("idle")
        }
    }, [config.address])

    useEffect(() => {
        if (receipt && receipt.status === "success") {
            // contract address in logs
            const contractAddress = receipt.logs?.[0]?.address || undefined
            if (contractAddress) {
                setState("success")
                setAddress(contractAddress)
                toast.success("Survey created successfully! Contract address: " + contractAddress)
            } else {
                setState("error")
                toast.error("Failed to retrieve contract address from transaction receipt.")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt, txHash])

    const onSubmit = async (data: SurveySettingsData) => {
        if (!account.address) {
            toast.error("Please connect your wallet to create a survey.")
            return
        }

        setState("signing")
        setTxHash(null)
        try {
            const isVerified = await signAndVerify(account.address as `0x${string}`)
            if (!isVerified) {
                setState("error")
                throw new Error("Signature verification failed")
            }
            setState("loading")
        } catch (error) {
            setState("error")
            toast.error("Failed to sign message. Please try again." + (error instanceof Error ? error.message : ""))
            return
        }

        try {
            // Simulate wallet transaction
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
                {!editable && (
                    <Alert className="items-center mb-8">
                        <Info />
                        <AlertTitle className="text-lg font-semibold">
                            Survey Successfully Deployed
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                            Your survey has been created and deployed on-chain. You can now proceed to the next step to add questions and configure further details.
                        </AlertDescription>
                    </Alert>
                )}
                <Form  {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <FormField
                                control={form.control}
                                name="limitScale"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limit Scale *</FormLabel>
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
                                                min={0}
                                                max={1000}
                                                step={10}
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

                        <FormField
                            control={form.control}
                            name="disableFHE"
                            render={({ field }) => (
                                <FormItem className="flex items-start space-x-2">
                                    <FormControl>
                                        <Switch
                                            className="mt-2"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!editable}
                                        />
                                    </FormControl>
                                    <div>
                                        <FormLabel>
                                            Disable FHE (Fully Homomorphic Encryption)
                                        </FormLabel>
                                        <p className="text-xs text-subtle italic">
                                            If you disable FHE, survey responses will be visible to everyone. Enabling FHE keeps all answers private and encrypted, so only aggregated results are shown.
                                        </p>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            {
                                editable && (
                                    <Button
                                        type="submit"
                                        className="flex items-center gap-2"
                                        disabled={state === "loading" || state === "verifying" || state === "signing"}
                                    >
                                        {
                                            state === "loading" || state === "signing" || state === "verifying" ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (<Wallet className="w-4 h-4" />
                                            )
                                        }
                                        {
                                            state === "loading" ? "Creating Survey..." :
                                                state === "signing" ? "Signing..." :
                                                    state === "verifying" ? "Verifying..." :
                                                        state === "success" ? "Survey Created!" :
                                                            state === "error" ? "Error Creating Survey" :
                                                                "Sign & Create Survey"
                                        }
                                    </Button>
                                )
                            }
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
