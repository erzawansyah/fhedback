import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Section from "@/components/layout/Section";

// Types and Schemas
import {
    SURVEY_CATEGORY_VALUES,
    SurveySubmissionSchema,
} from "@/types/survey.schema";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

// utils component
import { defaultScale, defaultNominal, makeDefaultValues, type FormIn, type FormOut } from "../../../utils/survey-creation";
import { logger } from "../../../utils/logger";



export default function AdvancedSurveyCreation({
    defaultValue,
    onSubmit,
}: {
    defaultValue?: Partial<FormIn>;
    onSubmit?: (data: FormOut) => void;
}) {
    const form = useForm<FormIn>({
        /** PENTING: resolver dan generic sama-sama berdasarkan schema yang sama */
        resolver: zodResolver(SurveySubmissionSchema),
        mode: "onChange",
        defaultValues: { ...makeDefaultValues(), ...defaultValue },
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isValid },
    } = form;

    // FieldArray
    const tagsFA = useFieldArray({
        control,
        name: "metadata.tags" as any // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    const taFA = useFieldArray({ control, name: "metadata.targetAudience" as const });
    const qFA = useFieldArray({ control, name: "questions" as const });

    const submitHandler = handleSubmit((values: FormIn) => {
        // Parse values to output type with defaults applied
        const parsed = SurveySubmissionSchema.parse(values) as FormOut;
        
        logger.info('Advanced survey creation submission', {
            surveyTitle: parsed.metadata?.title,
            questionsCount: parsed.questions?.length,
            surveyType: 'advanced'
        });
        
        onSubmit?.(parsed);
    });

    const switchType = (index: number, nextType: "scale" | "nominal") => {
        if (nextType === "scale") {
            setValue(`questions.${index}`, defaultScale(5), { shouldValidate: true, shouldDirty: true });
        } else {
            setValue(`questions.${index}`, defaultNominal(4), { shouldValidate: true, shouldDirty: true });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={submitHandler} className="space-y-6">
                {/* General Information Section */}
                <Section
                    title="General Information"
                    description="Basic settings for your survey"
                >
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: SURV" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        A unique symbol to identify your survey
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="respondentLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Respondent Limit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of responses (default: 100)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Section>

                {/* Survey Metadata Section */}
                <Section
                    title="Survey Metadata"
                    description="Provide information about your survey content and purpose"
                >
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name="metadata.title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter survey title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="metadata.description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your survey purpose and goals"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="metadata.instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instructions *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide clear instructions for respondents"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="metadata.category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SURVEY_CATEGORY_VALUES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="metadata.language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="en, id, es, etc." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Use BCP 47 language codes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Tags Section */}
                        <div className="space-y-3">
                            <FormLabel>Tags</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {tagsFA.fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Input
                                            {...register(`metadata.tags.${index}`)}
                                            placeholder="Enter tag"
                                            className="w-32"
                                        />
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => tagsFA.remove(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => tagsFA.append("")}
                            >
                                Add Tag
                            </Button>
                        </div>

                        {/* Target Audience Section */}
                        <div className="space-y-3">
                            <FormLabel>Target Audience</FormLabel>
                            <div className="space-y-3">
                                {taFA.fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border rounded-base">
                                        <Input
                                            {...register(`metadata.targetAudience.${index}.name`)}
                                            placeholder="Trait name (e.g., Age)"
                                        />
                                        <Input
                                            {...register(`metadata.targetAudience.${index}.value`)}
                                            placeholder="Value (e.g., 18-24)"
                                        />
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => taFA.remove(index)}
                                        >
                                            Remove
                                        </Button>
                                        {errors.metadata?.targetAudience?.[index] && (
                                            <div className="col-span-full space-y-1">
                                                {errors.metadata.targetAudience[index]?.name && (
                                                    <p className="text-sm text-red-500">{errors.metadata.targetAudience[index]?.name?.message}</p>
                                                )}
                                                {errors.metadata.targetAudience[index]?.value && (
                                                    <p className="text-sm text-red-500">{errors.metadata.targetAudience[index]?.value?.message}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => taFA.append({ name: "", value: "" })}
                            >
                                Add Target Audience
                            </Button>
                        </div>
                    </div>
                </Section>

                {/* Questions Section */}
                <Section
                    title="Questions"
                    description="Design your survey questions with different response types"
                >
                    <div className="space-y-6">
                        {qFA.fields.map((f: any, qIndex: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            const qType = watch(`questions.${qIndex}.type`);
                            return (
                                <div key={f.id} className="p-4 border border-border rounded-base space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FormLabel>Question Type</FormLabel>
                                            <Select
                                                value={qType}
                                                onValueChange={(value) => switchType(qIndex, value as "scale" | "nominal")}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="scale">Scale</SelectItem>
                                                    <SelectItem value="nominal">Nominal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => qFA.remove(qIndex)}
                                        >
                                            Remove Question
                                        </Button>
                                    </div>
                                    {/* Question Text Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name={`questions.${qIndex}.text`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Text *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your question" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name={`questions.${qIndex}.helperText`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Helper Text</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Additional instructions (optional)" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {/* Scale-specific fields */}
                                    {qType === "scale" && (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <FormField
                                                control={control}
                                                name={`questions.${qIndex}.minScore`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Min Score</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={control}
                                                name={`questions.${qIndex}.maxScore`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max Score</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={control}
                                                name={`questions.${qIndex}.minLabel`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Min Label</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Strongly Disagree" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={control}
                                                name={`questions.${qIndex}.maxLabel`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max Label</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Strongly Agree" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                    {/* Nominal-specific fields */}
                                    {qType === "nominal" && (
                                        <div className="space-y-3">
                                            <FormLabel>Answer Options</FormLabel>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(watch(`questions.${qIndex}.labels`) || []).map((_: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    (<FormField
                                                        key={i}
                                                        control={control}
                                                        name={`questions.${qIndex}.labels.${i}.text`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Option {i + 1}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={`Option ${i + 1}`} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />)
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Display validation errors */}
                                    {errors.questions?.[qIndex] && (
                                        <div className="space-y-1">
                                            {Object.entries(errors.questions[qIndex] as any).map(([key, error]: [string, any]) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                (<p key={key} className="text-sm text-red-500">
                                                    {(error as any)?.message} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                                                </p>)
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        <Button
                            type="button"
                            variant="neutral"
                            onClick={() => qFA.append(defaultScale(5))}
                        >
                            Add Question
                        </Button>
                    </div>
                </Section>

                {/* Submit Section */}
                <Section variant="highlighted">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                            {!isValid && (
                                <Badge variant="neutral" className="text-red-500">
                                    Please fix validation errors
                                </Badge>
                            )}
                        </div>
                        <Button type="submit" disabled={isSubmitting || !isValid} size="lg">
                            {isSubmitting ? "Creating Survey..." : "Create Survey"}
                        </Button>
                    </div>
                </Section>
            </form>
        </Form>
    )
}
