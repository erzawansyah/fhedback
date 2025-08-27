// survey.schema.ts
import { z } from "zod";

/* -----------------------------------------
   SURVEY METADATA
----------------------------------------- */

// Nilai kategori yang stabil
export const SURVEY_CATEGORY_VALUES = [
  "product_feedback",
  "user_experience",
  "market_research",
  "academic_research",
  "event_feedback",
  "psychological_assessment",
  "other",
] as const;

export const SurveyCategorySchema = z.enum(SURVEY_CATEGORY_VALUES);

// Target audience: mirip atribut ERC-721
export const SurveyTargetAudienceSchema = z.object({
  name: z.string().min(1, "name is required"),
  value: z.string().min(1, "value is required"),
});

// Metadata off-chain
export const SurveyMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructions: z.string().min(1),
  category: SurveyCategorySchema,
  tags: z.array(z.string().min(1)).default([]),
  // Validasi sederhana BCP 47. Bila perlu, ganti dengan lib validator bahasa.
  language: z.string().regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/, "invalid BCP 47 language tag"),
  targetAudience: z.array(SurveyTargetAudienceSchema).default([]),
});

/* -----------------------------------------
   SURVEY QUESTIONS
----------------------------------------- */

// Label untuk nominal
export const NominalLabelSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1),
});

// Skala numerik
export const ScaleResponseSchema = z.object({
  type: z.literal("scale"),
  minScore: z.literal(1),
  maxScore: z.number().int().min(2).max(10),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
});

// Kategori tak berurutan
export const NominalResponseSchema = z
  .object({
    type: z.literal("nominal"),
    minScore: z.literal(1),
    maxScore: z.number().int().min(2).max(10),
    labels: z.array(NominalLabelSchema),
  })
  .superRefine((val, ctx) => {
    // Panjang labels harus = maxScore
    if (val.labels.length !== val.maxScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["labels"],
        message: "labels length must equal maxScore",
      });
    }
    // id harus 1..maxScore dan unik
    const ids = val.labels.map(l => l.id);
    const expected = Array.from({ length: val.maxScore }, (_, i) => i + 1);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["labels"],
        message: "label ids must be unique",
      });
    }
    const sameOrder =
      ids.length === expected.length && ids.every((v, i) => v === expected[i]);
    if (!sameOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["labels"],
        message: "label ids must be sequential starting at 1",
      });
    }
  });

export const QuestionResponseSchema = z.union([
  ScaleResponseSchema,
  NominalResponseSchema,
]);

// Grouping
export const SurveyGroupSchema = z.object({
  id: z.number().int().nonnegative(),
  label: z.string().min(1),
  description: z.string().optional(),
});

// Pertanyaan tunggal
export const SurveyQuestionSchema = z.object({
  id: z.number().int().nonnegative(),
  groupId: z.number().int().nonnegative(),
  text: z.string().min(1),
  helperText: z.string().optional(),
  response: QuestionResponseSchema,
});

// Root survey questions
export const SurveyQuestionsSchema = z
  .object({
    name: z.string().min(1),
    totalQuestions: z.number().int().nonnegative(),
    group: z.array(SurveyGroupSchema),
    questions: z.array(SurveyQuestionSchema),
  })
  .superRefine((val, ctx) => {
    // totalQuestions harus sama dengan jumlah questions
    if (val.totalQuestions !== val.questions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalQuestions"],
        message: "totalQuestions must equal questions.length",
      });
    }
    // groupId harus valid
    const groupIds = new Set(val.group.map(g => g.id));
    val.questions.forEach((q, i) => {
      if (!groupIds.has(q.groupId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", i, "groupId"],
          message: `groupId ${q.groupId} does not exist in group`,
        });
      }
    });
    // id pertanyaan unik
    const qIds = val.questions.map(q => q.id);
    const qUnique = new Set(qIds);
    if (qUnique.size !== qIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions"],
        message: "question ids must be unique",
      });
    }
  });

// Survey submission yang menggabungkan question text dengan response
export const SurveySubmissionQuestionSchema = z.intersection(
  z.object({
    text: z.string().min(1, "Question text is required"),
    helperText: z.string().optional(),
  }),
  QuestionResponseSchema
);

export const SurveySubmissionSchema = z.object({
  symbol: z.string().min(1).max(100),
  respondentLimit: z.number().min(1).max(1000).default(100),
  metadata: SurveyMetadataSchema,
  questions: z.array(SurveySubmissionQuestionSchema),
});



/* -----------------------------------------
   TYPE ALIASES DARI SKEMA
----------------------------------------- */

export type SurveyCategory = z.infer<typeof SurveyCategorySchema>;
export type SurveyTargetAudience = z.infer<typeof SurveyTargetAudienceSchema>;
export type SurveyMetadata = z.infer<typeof SurveyMetadataSchema>;

export type NominalLabel = z.infer<typeof NominalLabelSchema>;
export type ScaleResponse = z.infer<typeof ScaleResponseSchema>;
export type NominalResponse = z.infer<typeof NominalResponseSchema>;
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;
export type SurveySubmissionQuestion = z.infer<typeof SurveySubmissionQuestionSchema>;

export type SurveyGroup = z.infer<typeof SurveyGroupSchema>;
export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;
export type SurveyQuestions = z.infer<typeof SurveyQuestionsSchema>;

export type SurveySubmission = z.infer<typeof SurveySubmissionSchema>;


/* -----------------------------------------
   HELPER
----------------------------------------- */

export function parseSurveyQuestions(json: unknown): SurveyQuestions {
  return SurveyQuestionsSchema.parse(json);
}

export function safeParseSurveyQuestions(json: unknown) {
  return SurveyQuestionsSchema.safeParse(json);
}
