import { SelectOption } from "../types";

// Survey category options for consistent dropdown usage
export const SURVEY_CATEGORIES: SelectOption[] = [
  { value: "market-research", label: "Market Research" },
  { value: "customer-feedback", label: "Customer Feedback" },
  { value: "academic-research", label: "Academic Research" },
  { value: "product-feedback", label: "Product Feedback" },
  { value: "employee-satisfaction", label: "Employee Satisfaction" },
  { value: "event-feedback", label: "Event Feedback" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

// Survey settings constraints
export const SURVEY_LIMITS = {
  TITLE: {
    MIN: 1,
    MAX: 100,
  },
  DISPLAY_TITLE: {
    MIN: 1,
    MAX: 200,
  },
  DESCRIPTION: {
    MAX: 1000,
  },
  QUESTIONS: {
    MIN: 1,
    MAX: 20,
    TEXT_MAX: 500,
  },
  SCALE: {
    MIN: 2,
    MAX: 10,
  },
  RESPONDENTS: {
    MIN: 1,
    MAX: 1000,
  },
  TAGS: {
    MAX: 500,
  },
} as const;

// Status colors mapping for consistent styling
export const STATUS_COLORS = {
  success: "border-green-500 bg-green-50 text-green-700",
  warning: "border-yellow-500 bg-yellow-50 text-yellow-700",
  error: "border-red-500 bg-red-50 text-red-700",
  info: "border-blue-500 bg-blue-50 text-blue-700",
  loading: "border-gray-500 bg-gray-50 text-gray-700",
  pending: "border-orange-500 bg-orange-50 text-orange-700",
} as const;

// Status badge colors for consistent styling
export const STATUS_BADGE_COLORS = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  loading: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-orange-100 text-orange-800 border-orange-200",
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  TITLE_REQUIRED: "Title is required",
  TITLE_TOO_LONG: "Title must be less than 100 characters",
  DISPLAY_TITLE_REQUIRED: "Display title is required",
  DISPLAY_TITLE_TOO_LONG: "Title must be less than 200 characters",
  DESCRIPTION_TOO_LONG: "Description must be less than 1000 characters",
  CATEGORY_REQUIRED: "Category is required",
  MIN_LABEL_REQUIRED: "Min label is required",
  MAX_LABEL_REQUIRED: "Max label is required",
  QUESTIONS_MIN: "At least one question is required",
  QUESTIONS_MAX: "Maximum 20 questions allowed",
  QUESTION_EMPTY: "Question cannot be empty",
  QUESTION_TOO_LONG: "Question must be less than 500 characters",
  SCALE_MIN: "Scale must be at least 2",
  SCALE_MAX: "Scale maximum is 10",
  RESPONDENTS_MIN: "Must allow at least 1 respondent",
  RESPONDENTS_MAX: "Maximum 1,000 respondents",
  TOTAL_QUESTIONS_MIN: "Must have at least 1 question",
  TOTAL_QUESTIONS_MAX: "Currently, the maximum is 20 questions",
} as const;

// Grid column configurations
export const GRID_COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

// Common form field sizes
export const FIELD_SIZES = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;
