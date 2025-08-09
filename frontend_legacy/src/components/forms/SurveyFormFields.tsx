import React from "react";
import { Control } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateSurveyFormSchema } from "@/lib/schemas";
import { Checkbox } from '@/components/ui/checkbox'

interface SurveyFormFieldsProps {
    control: Control<CreateSurveyFormSchema>;
}

export function SurveyFormFields({ control }: SurveyFormFieldsProps) {
    return (
        <>
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Survey Title <span className="text-error">*</span></FormLabel>
                        <FormDescription className="text-subtle text-xs">
                            Enter a clear and concise title for your survey. This title will be stored on the blockchain and displayed on the frontend. You will be able to configure its metadata after the platform is published.
                        </FormDescription>
                        <FormControl>
                            <Input placeholder="Enter your survey title" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid gap-4">
                <FormField
                    control={control}
                    name="scaleLimit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Scale Limit <span className="text-error">*</span></FormLabel>
                            <FormDescription className="text-subtle text-xs">
                                Specify the upper limit for your survey scale. For example, if you choose 5, respondents will rate on a scale from 1 to 5. If you choose 10, the scale will range from 1 to 10.
                            </FormDescription>
                            <FormControl>
                                <Input type="number" placeholder="7" max={10} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="respondentLimit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Respondent Limit <span className="text-error">*</span></FormLabel>
                            <FormDescription className="text-subtle text-xs">
                                Specify the maximum number of respondents allowed to participate in this survey. Once the limit is reached, no additional responses will be accepted.
                            </FormDescription>
                            <FormControl>
                                <Input type="number" placeholder="100" max={1000} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="totalQuestions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Questions <span className="text-error">*</span></FormLabel>
                            <FormDescription className="text-subtle text-xs">
                                Indicate the total number of questions in your survey. This sets a hard limit: you can only add questions up to this number, and you won&apos;t be able to increase it later.
                            </FormDescription>
                            <FormControl>
                                <Input type="number" placeholder="30" max={50} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="fhePowered"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <div className="flex items-start space-x-3">
                                <FormControl className="cursor-pointer">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className=" cursor-pointer">
                                    Enable Fully Homomorphic Encryption (FHE) for enhanced privacy and security.
                                </FormLabel>
                            </div>
                            <FormDescription className="text-subtle text-xs">
                                Enabling Fully Homomorphic Encryption (FHE) ensures that all survey responses are encrypted in a way that allows computations to be performed directly on the encrypted data without needing to decrypt it first. This provides an additional layer of privacy and security, making it ideal for sensitive surveys where respondent confidentiality is paramount.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}
