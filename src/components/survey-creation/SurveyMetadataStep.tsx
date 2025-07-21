"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Info, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { setMetadata } from "@/lib/utils/setMetadata"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { sign } from "@/lib/utils/signMessage"

// Schema untuk metadata survey
const surveyMetadataSchema = z.object({
    displayTitle: z.string().min(1, "Display title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional().or(z.literal("")),
    category: z.string().min(1, "Category is required"),
    scaleLabels: z.object({
        minLabel: z.string().min(1, "Min label is required"),
        maxLabel: z.string().min(1, "Max label is required"),
    }),
    tags: z.string().optional().or(z.literal("")),
})

export type SurveyMetadataData = z.infer<typeof surveyMetadataSchema>

export const SurveyMetadataStep = () => {
    const [txHash, setTxHash] = useState<`0x${string}` | string | null>(null)
    const { isSuccess, isError } = useWaitForTransactionReceipt({
        hash: typeof txHash === "string" && txHash.startsWith("0x") ? (txHash as `0x${string}`) : undefined,
    })
    const [isLoading, setIsLoading] = useState(false);
    const [limitScale] = useState(5);
    const account = useAccount()

    const form = useForm<SurveyMetadataData>({
        resolver: zodResolver(surveyMetadataSchema),
        defaultValues: {
            displayTitle: "",
            description: "",
            category: "",
            scaleLabels: {
                minLabel: "Strongly Disagree",
                maxLabel: "Strongly Agree",
            },
            tags: "",
        },
    })

    const onSubmit = async (data: SurveyMetadataData) => {
        let signature: { message: string; hash: string } | null = null;
        try {
            const { message, signature: hash } = await sign(account.address as `0x${string}`)
            if (!hash) {
                throw new Error("Failed to sign message")
            }
            signature = {
                message: message,
                hash: hash,
            }
        } catch (error) {
            console.error("Error signing message:", error)
            toast.error(`Failed to sign message: ${error instanceof Error ? error.message : "Unknown error"}`)
            return
        }


        try {
            setIsLoading(true)
            const txHashResult = await setMetadata({
                address: account.address as `0x${string}` | null,
                signature: signature.hash,
                message: signature.message,
                data: {
                    title: data.displayTitle,
                    description: data.description || "",
                    categories: data.category,
                    minLabel: data.scaleLabels.minLabel,
                    maxLabel: data.scaleLabels.maxLabel,
                    tags: data.tags?.split(",").map(tag => tag.trim()) || [],
                },
            })

            setTxHash(txHashResult)
            toast.success("Survey metadata saved successfully!")

            if (isSuccess) {
                toast.success("Transaction confirmed! Metadata set successfully.")
            }

            if (isError) {
                toast.error("Transaction failed! Please try again.")
            }

        } catch (error) {
            console.error("Error in wallet interaction:", error)
            toast.error(`Failed to save survey metadata: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Step 2: Survey Metadata (Optional)
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Add display information for your survey. This can be skipped and completed later.
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                            disabled={isLoading}
                                        />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what your survey is about..."
                                            className="min-h-[100px]"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
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

                        {/* Scale Labels */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Scale Labels (1 to {limitScale})</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Define what the minimum and maximum values mean in your rating scale.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="scaleLabels.maxLabel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Label for &quot;{limitScale}&quot;</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Strongly Agree"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </div>

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
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <div className="space-x-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2"
                                >
                                    <Wallet className="w-4 h-4" />
                                    {isLoading ? "Processing..." : "Save & Sign Transaction"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
