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

export default function BasicSurveyCreation({
    form, handleSubmit
}: {
    form: UseFormReturn<FormIn>;
    handleSubmit: (values: FormOut) => Promise<void>
}) {


    const controlUI = form.control as unknown as Control<FormInUI>;

    const {
        control,
    } = form;

    const onSubmit = form.handleSubmit(async (values: FormIn) => {
        // Parse the values using the schema to get FormOut type
        const parsed = SurveySubmissionSchema.parse(values) as FormOut;
        await handleSubmit(parsed);
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

                    <TextAreaInput
                        control={control}
                        name="metadata.instructions"
                        label="Instructions"
                        description="Guidance for respondents"
                        placeholder="Tell respondents how to answer"
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
                            label="Scale Limit"
                            description="The maximum value for the scale question"
                            placeholder="Ex: 5"
                            tooltip="Set a limit to control the maximum value for the scale question."
                            min={1}
                            max={100}
                            step={5}
                            required
                        />
                    </div>

                    <ArrayTextInput
                        control={control}
                        name="metadata.tags"
                        label="Survey Tags"
                        description="Tags to help categorize your survey separated by comma"
                        placeholder="Enter tags"
                        tooltip="Add relevant tags to your survey for better organization."
                        required
                    />
                </Section>
                <Button type="submit">Create Survey</Button>
            </form>
        </Form>
    );
}
