"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wallet, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Schema untuk pengaturan survey
const surveySettingsSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    totalQuestions: z.number().min(1, "Must have at least 1 question").max(50, "Maximum 50 questions"),
    limitScale: z.number().min(2, "Scale must be at least 2").max(10, "Scale maximum is 10"),
    respondentLimit: z.number().min(1, "Must allow at least 1 respondent").max(10000, "Maximum 10,000 respondents"),
})

export type SurveySettingsData = z.infer<typeof surveySettingsSchema>

interface SurveySettingsStepProps {
    onNext: (data: SurveySettingsData) => void
    initialData?: Partial<SurveySettingsData>
    isLoading?: boolean
}

export const SurveySettingsStep = ({ onNext, initialData, isLoading = false }: SurveySettingsStepProps) => {
    const form = useForm<SurveySettingsData>({
        resolver: zodResolver(surveySettingsSchema),
        defaultValues: {
            title: initialData?.title || "",
            totalQuestions: initialData?.totalQuestions || 5,
            limitScale: initialData?.limitScale || 5,
            respondentLimit: initialData?.respondentLimit || 100,
        },
    })

    // Mock wallet interaction
    const handleWalletInteraction = async (data: SurveySettingsData) => {
        console.log("Mock: Wallet interaction for survey settings", data)

        // Simulate wallet transaction
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                console.log("Mock: Survey settings transaction confirmed")
                resolve(true)
            }, 2000)
        })
    }

    const onSubmit = async (data: SurveySettingsData) => {
        try {
            const success = await handleWalletInteraction(data)
            if (success) {
                onNext(data)
            }
        } catch (error) {
            console.error("Error in wallet interaction:", error)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Step 1: Survey Settings
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Configure basic survey parameters. This will require wallet interaction.
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Survey Title *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter survey title"
                                            {...field}
                                            disabled={isLoading}
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
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading}
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
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading}
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
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <Wallet className="w-4 h-4" />
                                {isLoading ? "Processing..." : "Continue & Sign Transaction"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
