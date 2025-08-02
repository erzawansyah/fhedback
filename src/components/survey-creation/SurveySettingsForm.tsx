"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSurveyCreationContext } from "@/context/SurveyCreationContext"
import { useEffect } from "react"
import { surveySettingsSchema, SurveySettingsType } from "./formSchema"
import { SurveyCreationStatus } from "@/types/survey-creation"

import { Wallet, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { 
    TextField, 
    NumberField,
    FormSection,
    FormGrid,
    StatusAlert,
    LoadingState,
    ContractAddress
} from "./shared"

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
    const { config, surveyAddress, isLoading } = useSurveyCreationContext();
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

    // Determine if inputs should be disabled
    const inputsDisabled = disabled || (!!surveyAddress && isLoading);
    const isSettingsLoading = surveyAddress && isLoading && !config;

    // Loading state
    if (isSettingsLoading) {
        return <LoadingState message="Loading survey configuration..." />
    }

    return (
        <>
            {/* Survey Deployment Success Alert */}
            {disabled && surveyAddress && (
                <StatusAlert
                    type="success"
                    title="Survey Successfully Deployed"
                    description="Your survey has been created and deployed on-chain. You can now proceed to the next step to add metadata and configure further details."
                    className="mb-6"
                />
            )}

            {/* Contract Address Display */}
            {surveyAddress && (
                <ContractAddress
                    address={surveyAddress}
                    className="mb-6"
                    showCopy={true}
                    showExplorer={false}
                />
            )}

            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Basic Settings Section */}
                    <FormSection 
                        title="Basic Settings"
                        description="Configure the fundamental properties of your survey"
                    >
                        <TextField
                            control={form.control}
                            name="title"
                            label="Survey Title *"
                            placeholder="Enter survey title"
                            disabled={inputsDisabled}
                        />
                    </FormSection>

                    {/* Survey Configuration Section */}
                    <FormSection 
                        title="Survey Configuration"
                        description="Set the structure and limits for your survey"
                    >
                        <FormGrid columns={3}>
                            <NumberField
                                control={form.control}
                                name="totalQuestions"
                                label="Total Questions *"
                                placeholder="5"
                                min={1}
                                max={20}
                                disabled={inputsDisabled}
                            />

                            <NumberField
                                control={form.control}
                                name="limitScale"
                                label="Rating Scale *"
                                placeholder="5"
                                min={2}
                                max={10}
                                disabled={inputsDisabled}
                            />

                            <NumberField
                                control={form.control}
                                name="respondentLimit"
                                label="Max Respondents *"
                                placeholder="100"
                                min={1}
                                max={1000}
                                disabled={inputsDisabled}
                            />
                        </FormGrid>
                    </FormSection>

                    {/* Privacy Settings Section */}
                    <FormSection 
                        title="Privacy Settings"
                        description="Configure encryption and privacy options for your survey"
                    >
                        <FormField
                            control={form.control}
                            name="disableFHE"
                            render={({ field }) => (
                                <FormItem className={
                                    "flex flex-row items-center justify-between rounded-base " +
                                    "border-2 border-border p-4 bg-secondary-background"
                                }>
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-foreground font-mono">
                                            Disable FHE Encryption
                                        </FormLabel>
                                        <div className="text-sm font-mono text-foreground/70">
                                            Turn off fully homomorphic encryption for faster processing (less secure)
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={inputsDisabled}
                                            className="data-[state=checked]:bg-main data-[state=unchecked]:bg-secondary-background"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </FormSection>

                    {/* Warning Alert */}
                    <StatusAlert
                        type="warning"
                        title="Important Notice"
                        description="Once deployed, survey settings cannot be modified. Please review all configurations carefully before proceeding."
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            variant="default"
                            disabled={disabled || status === "loading" || status === "signing" || status === "verifying"}
                            className="flex items-center gap-2"
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
                    </div>
                </form>
            </Form>
        </>
    )
}
