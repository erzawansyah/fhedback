import { type Control, type UseFormReturn } from "react-hook-form";
import type { FormIn, FormOut } from "@/utils/survey-creation";
import { Form } from "@/components/ui/form";
import { Button } from "../../ui/button";
import { SURVEY_CATEGORY_VALUES, SurveySubmissionSchema } from "@/types/survey.schema";
import TextInput from "../elements/TextInput";
import Section from "../../layout/Section";
import TextAreaInput from "../elements/TextAreaInput";
import SelectInput from "../elements/SelectInput";
import NumberInput from "../elements/NumberInput";
import ArrayTextInput from "../elements/ArrayTextInput";
import AddQuestions from "../elements/AddQuestions";


type GlobalExtras = {
    global: {
        type: "scale" | "nominal";
        maxScore: number;
        minLabel?: string;
        maxLabel?: string;
        nominalLabels?: string[];
    };
};
type FormInUI = FormIn & GlobalExtras;

export default function BasicSurveyCreation(props: {
    form: UseFormReturn<FormIn>;
    handleSubmit: (values: FormOut) => Promise<void>;
}) {
    const { form, handleSubmit } = props;


    const controlUI = form.control as unknown as Control<FormInUI>;

    const {
        control,
        watch,
    } = form;

    // Watch global type to show/hide relevant fields
    const globalType = watch("global.type" as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const onSubmit = form.handleSubmit(async (values: FormIn) => {
        console.log("🚀 onSubmit function called!");
        console.log("Form values before parsing:", values);
        console.log("Questions in form:", values.questions);
        console.log("Number of questions:", values.questions?.length || 0);

        // Get global settings from UI form
        const globalData = form.getValues() as unknown as FormInUI;
        const globalSettings = globalData.global;

        console.log("Global settings:", globalSettings);

        // Apply global settings to all questions
        const processedValues = {
            ...values,
            questions: values.questions?.map(question => {
                if (globalSettings?.type === "scale") {
                    return {
                        text: question.text,
                        helperText: question.helperText,
                        type: "scale" as const,
                        minScore: 1,
                        maxScore: globalSettings.maxScore || 5,
                        minLabel: globalSettings.minLabel || "",
                        maxLabel: globalSettings.maxLabel || "",
                    };
                } else {
                    // For nominal questions
                    const labels = globalSettings?.nominalLabels && globalSettings.nominalLabels.length > 0
                        ? globalSettings.nominalLabels.map((label, i) => ({ id: i + 1, text: label }))
                        : Array.from({ length: globalSettings?.maxScore || 4 }, (_, i) => ({
                            id: i + 1,
                            text: `Option ${i + 1}`,
                        }));

                    return {
                        text: question.text,
                        helperText: question.helperText,
                        type: "nominal" as const,
                        minScore: 1,
                        maxScore: globalSettings?.maxScore || 4,
                        labels,
                    };
                }
            }) || [],
        };

        console.log("Processed values with global settings:", processedValues);

        try {
            // Parse the processed values using the schema to get FormOut type
            const parsed = SurveySubmissionSchema.parse(processedValues) as FormOut;
            console.log("Parsed form values:", parsed);

            await handleSubmit(parsed);
        } catch (error) {
            console.error("Form validation error:", error);
            if (error instanceof Error) {
                console.error("Error details:", error.message);
            }
        }
    }, (errors) => {
        console.error("❌ Form submission errors:", errors);
        console.error("Full error object:", JSON.stringify(errors, null, 2));
        if (errors.questions) {
            console.error("Questions errors:", errors.questions);
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
                <Section
                    title="Basic Configuration"
                    description="Configure the basic settings for your survey."
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* Basic Survey Information */}
                        <TextInput
                            control={control}
                            name="symbol"
                            label="Survey Symbol"
                            description="A unique symbol to identify your survey (1-10 characters)"
                            placeholder="Ex: SURV"
                            tooltip="This symbol will be used to identify your survey in the system. Treat like a ticker in ERC20."
                            required
                        />

                        <NumberInput
                            control={control}
                            name="respondentLimit"
                            label="Respondent Limit"
                            description="The maximum number of respondents for your survey"
                            placeholder="Ex: 100"
                            tooltip="Set a limit to control how many people can respond to your survey."
                            min={1}
                            max={100}
                            step={5}
                            required
                        />
                    </div>

                    {/* Survey Title */}
                    <TextInput
                        control={control}
                        name="metadata.title"
                        label="Survey Title"
                        description="The main title of your survey"
                        placeholder="Enter survey title"
                        tooltip="This title will be displayed to respondents."
                        required
                    />

                    <TextAreaInput
                        control={control}
                        name="metadata.description"
                        label="Survey Description"
                        description="A brief description of what your survey is about"
                        placeholder="Enter survey description"
                        tooltip="Clean and concise description of your survey. It should be informative and engaging."
                        required
                        rows={2}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <SelectInput
                            control={control}
                            name="metadata.category"
                            label="Survey Category"
                            description="The category that best fits your survey"
                            options={SURVEY_CATEGORY_VALUES}
                            placeholder="Select category"
                            tooltip="Choose a category that represents your survey."
                            required
                        />

                        <SelectInput
                            control={control}
                            name="metadata.language"
                            label="Survey Language"
                            description="The primary language of your survey"
                            options={["EN", "ID", "ES", "FR", "DE"]}
                            placeholder="Select language"
                            tooltip="Choose the language that your survey will be presented in."
                            required
                        />

                        <SelectInput
                            control={controlUI}
                            name="global.type" // Ini harus diganti nantinya, karena nilai pada input ini akan disimpan ke setiap type di item pada questions
                            label="Question Type"
                            description="The type of question being asked"
                            options={["scale", "nominal"]}
                            placeholder="Select question type"
                            tooltip="Choose the type of question for this survey item. Scale is for rating questions, Nominal is for multiple choice."
                            required
                        />

                        <NumberInput
                            control={controlUI}
                            name="global.maxScore" // Ini harus diganti nantinya, karena harusnya ke questions.1.response.maxScore tapi pada setiap item
                            label={globalType === "scale" ? "Scale Limit" : "Number of Options"}
                            description={globalType === "scale" ? "The maximum value for the scale question" : "The number of options for nominal questions"}
                            placeholder="Ex: 5"
                            tooltip={globalType === "scale" ? "Set a limit to control the maximum value for the scale question." : "Set the number of options available for nominal questions."}
                            min={2}
                            max={10}
                            step={1}
                            required
                        />
                    </div>


                    {/* Scale-specific fields - only show when scale is selected */}
                    {globalType === "scale" && (
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput
                                control={controlUI}
                                name="global.minLabel"
                                label="Min Label (Scale)"
                                description="Label for the minimum value"
                                placeholder="Ex: Strongly Disagree"
                                tooltip="This label will appear for the lowest score in scale questions."
                            />

                            <TextInput
                                control={controlUI}
                                name="global.maxLabel"
                                label="Max Label (Scale)"
                                description="Label for the maximum value"
                                placeholder="Ex: Strongly Agree"
                                tooltip="This label will appear for the highest score in scale questions."
                            />
                        </div>
                    )}

                    {/* Nominal-specific fields */}
                    {globalType === "nominal" && (
                        <ArrayTextInput
                            control={controlUI}
                            name="global.nominalLabels"
                            label="Answer Options (Nominal)"
                            description="Available options for nominal questions separated by comma"
                            placeholder="Option 1, Option 2, Option 3"
                            tooltip="These options will be used for all nominal questions in this survey."
                        />
                    )}

                    <ArrayTextInput
                        control={control}
                        name="metadata.tags"
                        label="Survey Tags"
                        description="Tags to help categorize your survey separated by comma"
                        placeholder="Enter tags"
                        tooltip="Add relevant tags to your survey for better organization."
                        required
                    />


                    <TextAreaInput
                        control={control}
                        name="metadata.instructions"
                        label="Instructions"
                        description="Guidance for respondents"
                        placeholder="Tell respondents how to answer"
                        required
                        rows={2}
                    />
                    
                </Section>
                <Section
                    title="Add Questions"
                    description="Create and customize questions for your survey."
                >
                    <AddQuestions />
                </Section>
                <Button
                    type="submit"
                    onClick={() => {
                        console.log("🔥 Create Survey button clicked!");
                        console.log("Form values at click:", form.getValues());
                        console.log("Form errors:", form.formState.errors);
                        console.log("Form is valid:", form.formState.isValid);
                        console.log("Form is submitting:", form.formState.isSubmitting);
                    }}
                >
                    Create Survey
                </Button>
            </form>
        </Form>
    );
}
