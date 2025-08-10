// -----------------------------------------
// SURVEY METADATA
// -----------------------------------------

/**
 * Canonical survey categories for metadata. Values are stable string literals.
 * NOTE: These values can be changed in future versions.
 */
export const SurveyCategories = {
  PRODUCT_FEEDBACK: "product_feedback",
  USER_EXPERIENCE: "user_experience",
  MARKET_RESEARCH: "market_research",
  ACADEMIC_RESEARCH: "academic_research",
  OTHER: "other",
} as const;

/**
 * Category type resolved from SurveyCategories values.
 */
export type SurveyCategory = typeof SurveyCategories[keyof typeof SurveyCategories];

/**
 * Target audience item. Treat this like ERC-721 attributes:
 * name is the trait type, value is the trait value.
 */
export interface SurveyTargetAudience {
  /** Short, descriptive trait name (e.g., "Age", "Location"). */
  name: string;
  /** Free-form value describing the audience segment (e.g., "18-24", "Global"). */
  value: string;
}

/**
 * Metadata stored off-chain (e.g., IPFS) and referenced by metadataCID on-chain.
 */
export interface SurveyMetadata {
  /** Human-readable survey title. */
  title: string;
  /** Short description providing context and purpose. */
  description: string;
  /** Instructions displayed to respondents before answering. */
  instructions: string;
  /** High-level classification for filtering and discovery. */
  category: SurveyCategory;
  /** Free-form tags for search and grouping. */
  tags: ReadonlyArray<string>;
  /** Language code (BCP 47 preferred, e.g., "en", "id"). */
  language: string;
  /** Audience descriptors shown in the UI. */
  targetAudience: ReadonlyArray<SurveyTargetAudience>;
}

// -----------------------------------------
// SURVEY QUESTIONS
// -----------------------------------------

/**
 * Represents the allowed score value range.
 * In practice, minScore is always 1 and maxScore is between 2..10.
 */
export type Score = number;

/**
 * Label structure for nominal responses.
 * The id must be sequential starting from 1.
 */
export interface NominalLabel {
  id: number;
  text: string;
}

/**
 * Response type for questions measured on a numeric scale.
 * The scale always starts from 1 and ends at maxScore.
 */
export interface ScaleResponse {
  type: "scale";
  minScore: 1;
  maxScore: Score;       // Expected to be an integer in [2..10]
  minLabel?: string;     // Optional left anchor for UI
  maxLabel?: string;     // Optional right anchor for UI
}

/**
 * Response type for questions with unordered categories.
 * Each category is mapped to a unique numeric code from 1 to maxScore.
 */
export interface NominalResponse {
  type: "nominal";
  minScore: 1;
  maxScore: Score;                     // Expected to be an integer in [2..10]
  labels: ReadonlyArray<NominalLabel>; // Length should match maxScore
}

/**
 * Union type for all supported response formats.
 */
export type QuestionResponse = ScaleResponse | NominalResponse;

/**
 * Represents a group used to organize related questions.
 */
export interface SurveyGroup {
  id: number;
  label: string;
  description?: string;
}

/**
 * Represents a single question in the survey.
 */
export interface SurveyQuestion {
  /** Unique question identifier within the survey. */
  id: number;
  /** Must reference an existing SurveyGroup.id. */
  groupId: number;
  /** The question text shown to respondents. */
  text: string;
  /** Optional helper text for clarification. */
  helperText?: string;
  /** Response specification for this question. */
  response: QuestionResponse;
}

/**
 * Root object representing the entire survey definition.
 */
export interface SurveyQuestions {
  /** Human-readable survey name (UI display). */
  name: string;
  /** Must equal questions.length. */
  totalQuestions: number;
  /** Question groups used for UI organization. */
  group: ReadonlyArray<SurveyGroup>;
  /** The list of questions in this survey. */
  questions: ReadonlyArray<SurveyQuestion>;
}
