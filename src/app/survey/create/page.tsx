"use client"
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link";
import Section from "@/components/Section";
import { Lock } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { CreateSurveyHandler } from "@/components/CreateSurveyHandler";

const formSchema = z.object({
    title: z.string().min(3, { message: "Survey title must be at least 3 characters." }),
    description: z.string().optional(),
    scaleLimit: z.coerce.number()
        .min(2, { message: "Minimum value is 2." })
        .max(10, { message: "Maximum value is 10." }),
    respondentLimit: z.coerce.number()
        .min(1, { message: "Minimum value is 1." })
        .max(1000, { message: "Maximum value is 1000." }),
    totalQuestions: z.coerce.number()
        .min(1, { message: "Minimum value is 1." })
        .max(50, { message: "Maximum value is 50." }),
});

export type CreateSurveyFormSchema = z.infer<typeof formSchema>

export default function CreateSurveyPage() {
    const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [signed, setSigned] = useState<boolean>(false)
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
    const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null)


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            scaleLimit: 5,
            respondentLimit: 100,
            totalQuestions: 10,
        },
        mode: "onChange", // agar isValid selalu up-to-date
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setFormValues(values)
        setIsOpen(true)
    }

    // Tombol create survey disable jika form tidak valid atau sedang loading
    const isCreateDisabled = !form.formState.isValid;

    return (
        <main>
            <ConfirmationDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title="Review Process to Create a Survey"
            >
                {
                    formValues || formValues !== null ? <CreateSurveyHandler
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        formValues={formValues}
                        newSurveyState={{
                            signed,
                            txHash,
                            contractAddress,
                            setSigned,
                            setTxHash,
                            setContractAddress
                        }}
                    /> : null
                }
            </ConfirmationDialog>
            <Section variant="secondary" sectionClassName="py-16" className="flex flex-col gap-6 w-3xl">

                {/* Title Part */}
                <Card className="w-full bg-secondary-background">
                    <CardContent className="flex items-center gap-6 ">
                        <div>
                            <h1>Create New Survey</h1>
                            <p>Please fill in your survey details below. This content is just a dummy example.</p>
                        </div>
                    </CardContent>
                </Card>


                {/* Disclaimer Part */}
                <Alert>
                    <Lock />
                    <AlertTitle>
                        Platform Fee Disclaimer
                    </AlertTitle>
                    <AlertDescription>
                        Please note: Creating a survey on this platform will require a platform fee. The fee amount depends on the maximum number of questions and the maximum number of respondents you set for your survey.
                    </AlertDescription>
                </Alert>

                {/* Form Part */}
                <Card className="bg-secondary-background">
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Survey Title <span className="text-error">*</span></FormLabel>
                                            <FormDescription className="text-subtle text-xs">Enter a clear and concise title for your survey.</FormDescription>
                                            <FormControl>
                                                <Input placeholder="Enter your survey title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Survey Description
                                            </FormLabel>
                                            <FormDescription className="text-subtle text-xs">Provide a brief description to explain the purpose of your survey.</FormDescription>
                                            <FormControl>
                                                <Textarea placeholder="Short description for your survey (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid gap-4">
                                    <FormField
                                        control={form.control}
                                        name="scaleLimit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Scale Limit <span className="text-error">*</span></FormLabel>
                                                <FormDescription className="text-subtle text-xs">Set the maximum value for your survey scale (e.g., 5 or 10).</FormDescription>
                                                <FormControl>
                                                    <Input type="number" placeholder="7" max={10} {...field} />
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
                                                <FormLabel>Respondent Limit <span className="text-error">*</span></FormLabel>
                                                <FormDescription className="text-subtle text-xs">Specify the maximum number of respondents allowed.</FormDescription>
                                                <FormControl>
                                                    <Input type="number" placeholder="100" max={1000} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="totalQuestions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Questions <span className="text-error">*</span>
                                                </FormLabel>
                                                <FormDescription className="text-subtle text-xs">Indicate the total number of questions in your survey.</FormDescription>
                                                <FormControl>
                                                    <Input type="number" placeholder="30" max={50} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="mt-6 flex gap-4">
                                    <Button asChild variant={"neutral"} size="lg" className="font-heading w-full" type="reset">
                                        <Link href={"/"}>Cancel</Link>
                                    </Button>
                                    <Button size="lg" className="font-heading w-full cursor-pointer" type="submit" disabled={isCreateDisabled}>
                                        Create Private Survey
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </Section>
        </main >
    );
} 
