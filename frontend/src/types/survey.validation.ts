// survey.validate.ts
import { ZodError } from "zod";
import {
  type SurveyQuestions,
  SurveyQuestionsSchema,
  type SurveyMetadata,
  SurveyMetadataSchema,
} from "./survey.schema";
import { formatZodError, type ValidationIssue } from "@/utils/validation";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: ValidationIssue[] };

// Validasi gabungan metadata + questions (opsional dipakai kalau mau sekaligus)
export function validateSurveyBundle(input: {
  metadata: unknown;
  questions: unknown;
}): { metadata: ValidationResult<SurveyMetadata>; questions: ValidationResult<SurveyQuestions> } {
  return {
    metadata: safeValidate(SurveyMetadataSchema, input.metadata),
    questions: safeValidate(SurveyQuestionsSchema, input.questions),
  };
}

// Validasi hanya SurveyQuestions
export function validateSurveyQuestions(json: unknown): ValidationResult<SurveyQuestions> {
  return safeValidate(SurveyQuestionsSchema, json);
}

// Validasi hanya SurveyMetadata
export function validateSurveyMetadata(json: unknown): ValidationResult<SurveyMetadata> {
  return safeValidate(SurveyMetadataSchema, json);
}

// Versi yang melempar error kalau invalid
export function assertSurveyQuestions(json: unknown): SurveyQuestions {
  return SurveyQuestionsSchema.parse(json);
}
export function assertSurveyMetadata(json: unknown): SurveyMetadata {
  return SurveyMetadataSchema.parse(json);
}

// Helper generic
function safeValidate<T>(
  schema: { parse: (v: unknown) => T },
  json: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(json);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ZodError) {
      return { ok: false, errors: formatZodError(e) };
    }
    return { ok: false, errors: [{ path: "", message: (e as Error).message }] };
  }
}
