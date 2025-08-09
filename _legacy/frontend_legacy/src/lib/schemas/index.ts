import { z } from "zod";

/**
 * Validation schema for creating a new survey
 */
export const createSurveyFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Survey title must be at least 3 characters." }),
    scaleLimit: z.coerce
      .number()
      .min(2, { message: "Minimum value is 2." })
      .max(10, { message: "Maximum value is 10." }),
    respondentLimit: z.coerce
      .number()
      .min(1, { message: "Minimum value is 1." })
      .max(1000, { message: "Maximum value is 1000." }),
    totalQuestions: z.coerce
      .number()
      .min(1, { message: "Minimum value is 1." })
      .max(50, { message: "Maximum value is 50." }),
    fhePowered: z.boolean(),
  })
  .refine((data) => data.scaleLimit >= 2, {
    message: "Scale limit must be at least 2.",
  })
  .refine((data) => data.respondentLimit >= 1, {
    message: "Respondent limit must be at least 1.",
  })
  .refine((data) => data.totalQuestions >= 1, {
    message: "Total questions must be at least 1.",
  });

export type CreateSurveyFormSchema = z.infer<typeof createSurveyFormSchema>;
