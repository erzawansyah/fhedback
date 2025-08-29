import type z from "zod";
import type {   SurveySubmissionSchema } from "../../types/survey.schema";

/** Tipe form = INPUT TYPE dari Zod (mengizinkan undefined untuk field ber-default) */
export type FormIn = z.input<typeof SurveySubmissionSchema>;
export type FormOut = z.output<typeof SurveySubmissionSchema>; // hasil parse akhir, sudah terisi default

export const defaultScale = (maxScore = 5) =>
({
    type: "scale",
    minScore: 1,
    maxScore: Math.max(2, Math.min(10, maxScore)),
    minLabel: "Strongly Disagree",
    maxLabel: "Strongly Agree",
    text: "Please rate your agreement with this statement",
    helperText: "Select a number from 1 to " + Math.max(2, Math.min(10, maxScore)),
} as const);

export const defaultNominal = (maxScore = 4) =>
({
    type: "nominal",
    minScore: 1,
    maxScore: Math.max(2, Math.min(10, maxScore)),
    labels: Array.from({ length: Math.max(2, Math.min(10, maxScore)) }, (_, i) => ({
        id: i + 1,
        text: `Option ${i + 1}`,
    })),
    text: "Please select one of the following options",
    helperText: "Choose the option that best describes your answer",
} as const);

/** Factory defaultValues mengikuti FormIn (boleh undefined di field yang punya default) */
export function makeDefaultValues(): FormIn {
    return {
        symbol: "SURV",
        // respondentLimit: undefined, // biarkan schema give default 100
        metadata: {
            title: "Sample Survey",
            description: "This is a sample survey description",
            instructions: "Please answer all questions honestly",
            category: "product_feedback",
            // tags: undefined,           // biarkan schema default []
            language: "en",
            // targetAudience: undefined, // biarkan schema default []
        },
        questions: [defaultScale(5), defaultNominal(3)],
    };
}

// Default values untuk FormInUI (termasuk global settings)
export function makeDefaultValuesUI() {
    return {
        ...makeDefaultValues(),
        global: {
            type: "scale" as const,
            maxScore: 5,
            minLabel: "Strongly Disagree",
            maxLabel: "Strongly Agree",
            nominalLabels: ["Option 1", "Option 2", "Option 3", "Option 4"],
        },
    };
}
