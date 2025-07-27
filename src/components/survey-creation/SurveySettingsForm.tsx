"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useEffect } from "react"
import { surveySettingsSchema, SurveySettingsType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { Wallet, Info, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SurveySettingsFormProps {
    disabled: boolean
    status: SurveyCreationStatus
    onSubmit: (data: SurveySettingsType) => void
}

export const SurveySettingsForm: React.FC<SurveySettingsFormProps> = ({
    disabled,
    status,
    onSubmit
}) => {
    // Form configuration with validation
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
