import * as z from "zod";

// Zod schema for survey settings validation
export const surveySettingsSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  totalQuestions: z
    .number()
    .min(1, "Must have at least 1 question")
    .max(20, "Currently, the maximum is 20 questions"),
  limitScale: z
    .number()
    .min(2, "Scale must be at least 2")
    .max(10, "Scale maximum is 10"),
  respondentLimit: z
    .number()
    .min(1, "Must allow at least 1 respondent")
    .max(1000, "Maximum 1,000 respondents"),
  disableFHE: z.boolean().default(false).optional(),
});

// Zod schema for survey metadata validation
export const surveyMetadataSchema = z.object({
  displayTitle: z
    .string()
    .min(1, "Display title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  scaleLabels: z.object({
    minLabel: z.string().min(1, "Min label is required"),
    maxLabel: z.string().min(1, "Max label is required"),
  }),
  tags: z.string().optional().or(z.literal("")),
});

// Zod schema for survey questions validation
export const surveyQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, "Question cannot be empty")
          .max(500, "Question must be less than 500 characters"),
      })
    )
    .min(1, "At least one question is required")
    .refine((questions) => questions.length <= 20, {
      message: "Maximum 20 questions allowed",
    }),
});

// TypeScript type inference from Zod schemas for type safety
export type SurveySettingsType = z.infer<typeof surveySettingsSchema>;
export type SurveyMetadataType = z.infer<typeof surveyMetadataSchema>;
export type SurveyQuestionsType = z.infer<typeof surveyQuestionsSchema>;
