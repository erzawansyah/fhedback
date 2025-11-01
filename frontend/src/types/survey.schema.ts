// survey.schema.ts
import { z } from "zod"
import { 
  SURVEY_LIMITS, 
  SURVEY_CATEGORIES, 
  VALIDATION_MESSAGES 
} from "../constants/app"

/* -----------------------------------------
   SURVEY METADATA
----------------------------------------- */

// Survey category values
export const SURVEY_CATEGORY_VALUES = [
  SURVEY_CATEGORIES.PRODUCT_FEEDBACK,
  SURVEY_CATEGORIES.USER_EXPERIENCE,
  SURVEY_CATEGORIES.MARKET_RESEARCH,
  SURVEY_CATEGORIES.ACADEMIC_RESEARCH,
  SURVEY_CATEGORIES.EVENT_FEEDBACK,
  SURVEY_CATEGORIES.PSYCHOLOGICAL_ASSESSMENT,
  SURVEY_CATEGORIES.OTHER,
] as const

export const SurveyCategorySchema = z.enum(SURVEY_CATEGORY_VALUES)

// Target audience schema
export const SurveyTargetAudienceSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  value: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
})

// Enhanced metadata schema with proper validation
export const SurveyMetadataSchema = z.object({
  title: z.string()
    .min(SURVEY_LIMITS.TITLE_MIN_LENGTH, VALIDATION_MESSAGES.TITLE_TOO_SHORT)
    .max(SURVEY_LIMITS.TITLE_MAX_LENGTH, VALIDATION_MESSAGES.TITLE_TOO_LONG),
  description: z.string()
    .min(SURVEY_LIMITS.DESCRIPTION_MIN_LENGTH, VALIDATION_MESSAGES.DESCRIPTION_TOO_SHORT)
    .max(SURVEY_LIMITS.DESCRIPTION_MAX_LENGTH, VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG),
  instructions: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  category: SurveyCategorySchema,
  tags: z.array(z.string().min(1)).default([]),
  // Simple BCP 47 language validation
  language: z.string().regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/, "Invalid language code"),
  targetAudience: z.array(SurveyTargetAudienceSchema).default([]),
})

/* -----------------------------------------
   SURVEY QUESTIONS
----------------------------------------- */

// Label for nominal responses
export const NominalLabelSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
})

// Numeric scale response schema
export const ScaleResponseSchema = z.object({
  type: z.literal("scale"),
  minScore: z.literal(1),
  maxScore: z.number().int().min(2).max(10),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
})

// Categorical (nominal) response schema
export const NominalResponseSchema = z
  .object({
    type: z.literal("nominal"),
    minScore: z.literal(1),
    maxScore: z.number().int().min(2).max(10),
    labels: z.array(NominalLabelSchema),
  })
  .superRefine((val, ctx) => {
    // Labels array length must equal maxScore
    if (val.labels.length !== val.maxScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["labels"],
        message: "Labels length must equal maxScore",
      })
    }
    
    // Label IDs must be 1..maxScore and unique
    const ids = val.labels.map(l => l.id)
    const expected = Array.from({ length: val.maxScore }, (_, i) => i + 1)
    const unique = new Set(ids)
    
    if (unique.size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["labels"],
        message: "Label IDs must be unique",
      })
    }
    
    const correctSequence = ids.length === expected.length && ids.every((v, i) => v === expected[i])
    if (!correctSequence) {
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
  respondentLimit: z.number()
    .min(SURVEY_LIMITS.RESPONDENT_LIMIT_MIN, VALIDATION_MESSAGES.RESPONDENT_LIMIT_TOO_LOW)
    .max(SURVEY_LIMITS.RESPONDENT_LIMIT_MAX, VALIDATION_MESSAGES.RESPONDENT_LIMIT_TOO_HIGH)
    .default(SURVEY_LIMITS.RESPONDENT_LIMIT_DEFAULT),
  metadata: SurveyMetadataSchema,
  questions: z.array(SurveySubmissionQuestionSchema)
    .min(SURVEY_LIMITS.QUESTIONS_MIN, VALIDATION_MESSAGES.QUESTIONS_TOO_FEW)
    .max(SURVEY_LIMITS.QUESTIONS_MAX, VALIDATION_MESSAGES.QUESTIONS_TOO_MANY),
})

/* -----------------------------------------
   TYPE ALIASES FROM SCHEMAS
----------------------------------------- */

export type SurveyCategory = z.infer<typeof SurveyCategorySchema>
export type SurveyTargetAudience = z.infer<typeof SurveyTargetAudienceSchema>
export type SurveyMetadata = z.infer<typeof SurveyMetadataSchema>

export type NominalLabel = z.infer<typeof NominalLabelSchema>
export type ScaleResponse = z.infer<typeof ScaleResponseSchema>
export type NominalResponse = z.infer<typeof NominalResponseSchema>
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>
export type SurveySubmissionQuestion = z.infer<typeof SurveySubmissionQuestionSchema>

export type SurveyGroup = z.infer<typeof SurveyGroupSchema>
export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>
export type SurveyQuestions = z.infer<typeof SurveyQuestionsSchema>

export type SurveySubmission = z.infer<typeof SurveySubmissionSchema>

/* -----------------------------------------
   HELPER FUNCTIONS
----------------------------------------- */

/**
 * Parse survey questions with validation
 * @param json - Raw JSON data to parse
 * @returns Validated SurveyQuestions object
 * @throws ZodError if validation fails
 */
export function parseSurveyQuestions(json: unknown): SurveyQuestions {
  return SurveyQuestionsSchema.parse(json)
}

/**
 * Safely parse survey questions without throwing
 * @param json - Raw JSON data to parse
 * @returns Safe parse result with success/error info
 */
export function safeParseSurveyQuestions(json: unknown) {
  return SurveyQuestionsSchema.safeParse(json)
}

/**
 * Validate survey submission data
 * @param data - Survey submission data to validate
 * @returns Validated SurveySubmission object
 * @throws ZodError if validation fails
 */
export function validateSurveySubmission(data: unknown): SurveySubmission {
  return SurveySubmissionSchema.parse(data)
}

/**
 * Check if survey data is valid without throwing
 * @param data - Survey submission data to validate
 * @returns boolean indicating if data is valid
 */
export function isValidSurveySubmission(data: unknown): boolean {
  return SurveySubmissionSchema.safeParse(data).success
}
