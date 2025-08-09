/**
 * Application-wide constants
 */

// Theme constants
export const THEME_STORAGE_KEY = "ui-theme" as const;

// Date formatting constants
export const DATE_FORMATS = {
  SHORT: {
    day: "2-digit" as const,
    month: "short" as const,
    year: "numeric" as const,
  },
  LONG: {
    day: "2-digit" as const,
    month: "long" as const,
    year: "numeric" as const,
  },
  NUMERIC: {
    day: "2-digit" as const,
    month: "2-digit" as const,
    year: "numeric" as const,
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Survey-related constants
export const SURVEY_CONSTANTS = {
  MIN_SCALE: 1,
  MAX_SCALE: 10,
  DEFAULT_SCALE: 5,
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_RESPONDENTS: 1,
  MAX_RESPONDENTS: 1000,
} as const;

// Route paths
export const ROUTES = {
  HOME: "/",
  SURVEY_CREATE: "/survey/create",
  SURVEY_LIST: "/survey",
  HOW_TO: "/how-to",
  STATISTICS: (id: string | number) => `/statistic/${id}`,
  SUBMIT: (id: string | number) => `/submit/${id}`,
} as const;

// API endpoints (if needed in the future)
export const API_ENDPOINTS = {
  SURVEYS: "/api/surveys",
  SURVEY: (id: string | number) => `/api/surveys/${id}`,
  STATISTICS: (id: string | number) => `/api/surveys/${id}/statistics`,
} as const;
