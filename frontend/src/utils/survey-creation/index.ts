import type z from "zod";
import type { SurveySubmissionSchema } from "../../types/survey.schema";

/** Tipe form = INPUT TYPE dari Zod (mengizinkan undefined untuk field ber-default) */
export type FormIn = z.input<typeof SurveySubmissionSchema>;
export type FormOut = z.output<typeof SurveySubmissionSchema>; // hasil parse akhir, sudah terisi default

export const defaultScale = (maxScore = 5) =>
({
    type: "scale",
    minScore: 1,
    maxScore: Math.max(2, Math.min(10, maxScore)),
    minLabel: "",
    maxLabel: "",
    text: "",
    helperText: "",
} as const);

export const defaultNominal = (maxScore = 4) =>
({
    type: "nominal",
    minScore: 1,
    maxScore: Math.max(2, Math.min(10, maxScore)),
    labels: Array.from({ length: Math.max(2, Math.min(10, maxScore)) }, (_, i) => ({
        id: i + 1,
        text: "",
    })),
    text: "",
    helperText: "",
} as const);

/** Factory defaultValues mengikuti FormIn (boleh undefined di field yang punya default) */
export function makeDefaultValues(): FormIn {
    return {
        symbol: "",
        // respondentLimit: undefined, // biarkan schema give default 100
        metadata: {
            title: "",
            description: "",
            instructions: "",
            category: "product_feedback",
            // tags: undefined,           // biarkan schema default []
            language: "en",
            // targetAudience: undefined, // biarkan schema default []
        },
        questions: [defaultScale(5), defaultNominal(3)],
    };
}
