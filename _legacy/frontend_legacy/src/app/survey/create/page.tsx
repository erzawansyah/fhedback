"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import Section from "@/components/Section";
import { SurveyCreationHeader } from "@/components/survey/SurveyCreationHeader";
import { SurveyFormFields } from "@/components/forms/SurveyFormFields";
import { SurveyFormActions } from "@/components/forms/SurveyFormActions";
import { createSurveyFormSchema, CreateSurveyFormSchema } from "@/lib/schemas";
import { useCreateSurvey } from "@/hooks/useCreateSurvey";
import { toast } from "sonner";
import SurveyCreationReceipt from "@/components/survey/SurveyCreationReceipt";

export default function CreateSurveyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [actionText, setActionText] = useState("Sign & Create Survey");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const form = useForm<CreateSurveyFormSchema>({
        resolver: zodResolver(createSurveyFormSchema),
        defaultValues: {
            title: "",
            scaleLimit: 5,
            respondentLimit: 100,
            totalQuestions: 10,
            fhePowered: true,
        },
        mode: "onChange", // agar isValid selalu up-to-date
    });
    const isCreateDisabled = !form.formState.isValid;

    const {
        status,
        signed,
        txHash,
        setStatus,
        createSurvey,
    } = useCreateSurvey();

    function onSubmit(values: CreateSurveyFormSchema) {
        if (status === "error") {
            // reset error message if form is resubmitted
            setErrorMessage(null);
            setActionText("Sign & Create Survey");
            setStatus("idle");
            form.reset();
            return;
        }
        setIsLoading(true);
        createSurvey(values)
            .then(() => {
                setIsLoading(false);
                form.reset();
            })
            .catch((error) => {
                setErrorMessage(error instanceof Error ? error.message : "Unknown error");
            }).finally(() => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        if (status === "loading") {
            setActionText(signed ? "Creating Survey..." : "Signing Survey...");
        } else if (status === "success") {
            setActionText("Survey Created!");
            toast.success("Survey created successfully!", {
                description: `Transaction Hash: ${txHash}`,
                action: {
                    label: "View Transaction",
                    onClick: () => {
                        window.open(`https://eth-sepolia.blockscout.com/tx/${txHash}`, "_blank");
                    },
                },
                duration: 5000,
                classNames: {
                    description: "text-xs text-subtle",
                }
            });
        } else if (status === "error") {
            setActionText("Error Transaction. Click to retry");
            toast.error(errorMessage || "Failed to create survey. Please try again.");
        }
    }, [status, signed, txHash, errorMessage]);
    return (
        <main>
            <Section
                variant="secondary"
                sectionClassName="py-16"
                className="flex flex-col gap-6 max-w-3xl"
            >
                <SurveyCreationHeader />
                {/* Form Section */}
                <Card className="bg-secondary-background">
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-6"
                            >
                                <SurveyFormFields control={form.control} />
                                <SurveyFormActions
                                    isCreateDisabled={isCreateDisabled}
                                    isLoading={isLoading}
                                    action_text={actionText}
                                />
                            </form>
                        </Form>
                        {
                            status === "success" && txHash && (
                                <SurveyCreationReceipt
                                    txhash={txHash}
                                    onError={(error) => {
                                        setErrorMessage(error.message);
                                        setStatus("error");
                                    }}
                                    onSuccess={(contractAddress) => {
                                        console.log("Survey contract created at:", contractAddress);
                                    }}
                                />
                            )
                        }
                    </CardContent>
                </Card>
            </Section>
        </main>
    );
}
