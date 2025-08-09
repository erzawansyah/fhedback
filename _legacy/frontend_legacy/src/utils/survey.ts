/**
 * Utility functions for survey-related calculations and validations
 */

import { SURVEY_CONSTANTS } from "@/lib/constants";
import { QuestionnaireMetadata } from "@/lib/interfaces/questionnaire";

/**
 * Calculates the completion percentage of a survey
 */
export function calculateSurveyProgress(
  currentRespondents: number,
  totalRespondents: number
): number {
  if (totalRespondents === 0) return 0;
  return Math.round((currentRespondents / totalRespondents) * 100 * 10) / 10;
}

/**
 * Checks if a survey is completed (reached respondent limit)
 */
export function isSurveyCompleted(survey: QuestionnaireMetadata): boolean {
  return survey.totalRespondents >= survey.respondentLimit;
}

/**
 * Checks if a survey is active (published and not closed)
 */
export function isSurveyActive(survey: QuestionnaireMetadata): boolean {
  return survey.published && !survey.closed;
}

/**
 * Validates survey scale limit
 */
export function isValidScaleLimit(scale: number): boolean {
  return (
    Number.isInteger(scale) &&
    scale >= SURVEY_CONSTANTS.MIN_SCALE &&
    scale <= SURVEY_CONSTANTS.MAX_SCALE
  );
}

/**
 * Validates number of questions
 */
export function isValidQuestionCount(count: number): boolean {
  return (
    Number.isInteger(count) &&
    count >= SURVEY_CONSTANTS.MIN_QUESTIONS &&
    count <= SURVEY_CONSTANTS.MAX_QUESTIONS
  );
}

/**
 * Validates respondent limit
 */
export function isValidRespondentLimit(limit: number): boolean {
  return (
    Number.isInteger(limit) &&
    limit >= SURVEY_CONSTANTS.MIN_RESPONDENTS &&
    limit <= SURVEY_CONSTANTS.MAX_RESPONDENTS
  );
}

/**
 * Gets the survey status text
 */
export function getSurveyStatus(survey: QuestionnaireMetadata): string {
  if (!survey.published) return "Draft";
  if (survey.closed) return "Closed";
  if (isSurveyCompleted(survey)) return "Completed";
  return "Active";
}

/**
 * Gets the survey status color class
 */
export function getSurveyStatusColor(survey: QuestionnaireMetadata): string {
  const status = getSurveyStatus(survey);

  switch (status) {
    case "Active":
      return "text-success bg-success-bg";
    case "Completed":
      return "text-info bg-info-bg";
    case "Closed":
      return "text-error bg-error-bg";
    case "Draft":
      return "text-warning bg-warning-bg";
    default:
      return "text-muted bg-secondary-background";
  }
}

/**
 * Formats survey scale display (e.g., "1-5")
 */
export function formatSurveyScale(scaleLimit: number): string {
  return `1-${scaleLimit}`;
}

/**
 * Generates a short survey ID from a longer ID
 */
export function getShortSurveyId(id: string | number): string {
  const idStr = id.toString();
  return idStr.length > 8 ? `${idStr.slice(0, 4)}...${idStr.slice(-4)}` : idStr;
}
