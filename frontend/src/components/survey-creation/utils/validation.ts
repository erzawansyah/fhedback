import { SURVEY_LIMITS, VALIDATION_MESSAGES } from "../constants";

/**
 * Validation helper functions for survey forms
 */

export function validateTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return VALIDATION_MESSAGES.TITLE_REQUIRED;
  }
  if (title.length > SURVEY_LIMITS.TITLE.MAX) {
    return VALIDATION_MESSAGES.TITLE_TOO_LONG;
  }
  return null;
}

export function validateDisplayTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return VALIDATION_MESSAGES.DISPLAY_TITLE_REQUIRED;
  }
  if (title.length > SURVEY_LIMITS.DISPLAY_TITLE.MAX) {
    return VALIDATION_MESSAGES.DISPLAY_TITLE_TOO_LONG;
  }
  return null;
}

export function validateDescription(description: string): string | null {
  if (description && description.length > SURVEY_LIMITS.DESCRIPTION.MAX) {
    return VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG;
  }
  return null;
}

export function validateCategory(category: string): string | null {
  if (!category || category.trim().length === 0) {
    return VALIDATION_MESSAGES.CATEGORY_REQUIRED;
  }
  return null;
}

export function validateQuestionText(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return VALIDATION_MESSAGES.QUESTION_EMPTY;
  }
  if (text.length > SURVEY_LIMITS.QUESTIONS.TEXT_MAX) {
    return VALIDATION_MESSAGES.QUESTION_TOO_LONG;
  }
  return null;
}

export function validateQuestionsArray(
  questions: { text: string }[]
): string | null {
  if (!questions || questions.length < SURVEY_LIMITS.QUESTIONS.MIN) {
    return VALIDATION_MESSAGES.QUESTIONS_MIN;
  }
  if (questions.length > SURVEY_LIMITS.QUESTIONS.MAX) {
    return VALIDATION_MESSAGES.QUESTIONS_MAX;
  }

  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const error = validateQuestionText(questions[i].text);
    if (error) {
      return `Question ${i + 1}: ${error}`;
    }
  }

  return null;
}

export function validateScale(scale: number): string | null {
  if (scale < SURVEY_LIMITS.SCALE.MIN) {
    return VALIDATION_MESSAGES.SCALE_MIN;
  }
  if (scale > SURVEY_LIMITS.SCALE.MAX) {
    return VALIDATION_MESSAGES.SCALE_MAX;
  }
  return null;
}

export function validateRespondentLimit(limit: number): string | null {
  if (limit < SURVEY_LIMITS.RESPONDENTS.MIN) {
    return VALIDATION_MESSAGES.RESPONDENTS_MIN;
  }
  if (limit > SURVEY_LIMITS.RESPONDENTS.MAX) {
    return VALIDATION_MESSAGES.RESPONDENTS_MAX;
  }
  return null;
}

export function validateTotalQuestions(total: number): string | null {
  if (total < SURVEY_LIMITS.QUESTIONS.MIN) {
    return VALIDATION_MESSAGES.TOTAL_QUESTIONS_MIN;
  }
  if (total > SURVEY_LIMITS.QUESTIONS.MAX) {
    return VALIDATION_MESSAGES.TOTAL_QUESTIONS_MAX;
  }
  return null;
}

export function validateScaleLabels(labels: {
  minLabel: string;
  maxLabel: string;
}): {
  minLabel: string | null;
  maxLabel: string | null;
} {
  return {
    minLabel:
      !labels.minLabel || labels.minLabel.trim().length === 0
        ? VALIDATION_MESSAGES.MIN_LABEL_REQUIRED
        : null,
    maxLabel:
      !labels.maxLabel || labels.maxLabel.trim().length === 0
        ? VALIDATION_MESSAGES.MAX_LABEL_REQUIRED
        : null,
  };
}

/**
 * Form-wide validation functions
 */
export function validateSurveyMetadata(data: {
  displayTitle: string;
  description?: string;
  category: string;
  scaleLabels: { minLabel: string; maxLabel: string };
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const titleError = validateDisplayTitle(data.displayTitle);
  if (titleError) errors.displayTitle = titleError;

  const descriptionError = validateDescription(data.description || "");
  if (descriptionError) errors.description = descriptionError;

  const categoryError = validateCategory(data.category);
  if (categoryError) errors.category = categoryError;

  const labelErrors = validateScaleLabels(data.scaleLabels);
  if (labelErrors.minLabel) errors.minLabel = labelErrors.minLabel;
  if (labelErrors.maxLabel) errors.maxLabel = labelErrors.maxLabel;

  return errors;
}

export function validateSurveySettings(data: {
  title: string;
  totalQuestions: number;
  limitScale: number;
  respondentLimit: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const titleError = validateTitle(data.title);
  if (titleError) errors.title = titleError;

  const questionsError = validateTotalQuestions(data.totalQuestions);
  if (questionsError) errors.totalQuestions = questionsError;

  const scaleError = validateScale(data.limitScale);
  if (scaleError) errors.limitScale = scaleError;

  const respondentError = validateRespondentLimit(data.respondentLimit);
  if (respondentError) errors.respondentLimit = respondentError;

  return errors;
}
