/**
 * Application Constants
 * 
 * Centralized configuration for the FHEdback application
 * including validation rules, limits, and default values.
 */

// Survey Creation Limits
export const SURVEY_LIMITS = {
  SYMBOL_MAX_LENGTH: 10,
  SYMBOL_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 500,
  DESCRIPTION_MIN_LENGTH: 10,
  QUESTIONS_MIN: 1,
  QUESTIONS_MAX: 50,
  RESPONDENT_LIMIT_MIN: 1,
  RESPONDENT_LIMIT_MAX: 1000,
  RESPONDENT_LIMIT_DEFAULT: 100,
} as const

// Survey Question Types
export const QUESTION_TYPES = {
  RATING: 'rating',
  MULTIPLE_CHOICE: 'multiple_choice',
} as const

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES]

// Survey Categories
export const SURVEY_CATEGORIES = {
  PRODUCT_FEEDBACK: 'product_feedback',
  USER_EXPERIENCE: 'user_experience', 
  MARKET_RESEARCH: 'market_research',
  ACADEMIC_RESEARCH: 'academic_research',
  EVENT_FEEDBACK: 'event_feedback',
  PSYCHOLOGICAL_ASSESSMENT: 'psychological_assessment',
  OTHER: 'other',
} as const

export type SurveyCategory = typeof SURVEY_CATEGORIES[keyof typeof SURVEY_CATEGORIES]

// Survey Status Constants
export const SURVEY_STATUS = {
  CREATED: 0,
  ACTIVE: 1,
  CLOSED: 2, 
  TRASHED: 3,
} as const

export type SurveyStatus = typeof SURVEY_STATUS[keyof typeof SURVEY_STATUS]

// Network Constants
export const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://eth-sepolia.blockscout.com',
    currency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH', 
      decimals: 18,
    },
  },
} as const

// IPFS/Storage Constants
export const STORAGE = {
  PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['application/json', 'text/plain'],
} as const

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300, // ms
  TOAST_DURATION: 5000, // ms
  POLLING_INTERVAL: 2000, // ms
  MAX_RETRIES: 3,
  SKELETON_COUNT: 3,
} as const

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_ADDRESS: 'Please enter a valid Ethereum address',
  TITLE_TOO_LONG: `Title must be no more than ${SURVEY_LIMITS.TITLE_MAX_LENGTH} characters`,
  TITLE_TOO_SHORT: `Title must be at least ${SURVEY_LIMITS.TITLE_MIN_LENGTH} character`,
  SYMBOL_TOO_LONG: `Symbol must be no more than ${SURVEY_LIMITS.SYMBOL_MAX_LENGTH} characters`,
  SYMBOL_TOO_SHORT: `Symbol must be at least ${SURVEY_LIMITS.SYMBOL_MIN_LENGTH} character`,
  DESCRIPTION_TOO_LONG: `Description must be no more than ${SURVEY_LIMITS.DESCRIPTION_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_SHORT: `Description must be at least ${SURVEY_LIMITS.DESCRIPTION_MIN_LENGTH} characters`,
  QUESTIONS_TOO_FEW: `Survey must have at least ${SURVEY_LIMITS.QUESTIONS_MIN} question`,
  QUESTIONS_TOO_MANY: `Survey cannot have more than ${SURVEY_LIMITS.QUESTIONS_MAX} questions`,
  RESPONDENT_LIMIT_TOO_LOW: `Respondent limit must be at least ${SURVEY_LIMITS.RESPONDENT_LIMIT_MIN}`,
  RESPONDENT_LIMIT_TOO_HIGH: `Respondent limit cannot exceed ${SURVEY_LIMITS.RESPONDENT_LIMIT_MAX}`,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
  TRANSACTION_REJECTED: 'Transaction was rejected by user',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  CONTRACT_ERROR: 'Smart contract error. Please try again.',
  VALIDATION_FAILED: 'Please fix the validation errors and try again',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  IPFS_UPLOAD_FAILED: 'Failed to upload data. Please try again.',
  SURVEY_NOT_FOUND: 'Survey not found or has been deleted',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SURVEY_CREATED: 'Survey created successfully!',
  SURVEY_UPDATED: 'Survey updated successfully!',
  SURVEY_PUBLISHED: 'Survey published successfully!',
  SURVEY_CLOSED: 'Survey closed successfully!',
  SURVEY_DELETED: 'Survey deleted successfully!',
  RESPONSE_SUBMITTED: 'Response submitted successfully!',
  METADATA_SAVED: 'Metadata saved successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
} as const

// Application Metadata
export const APP_METADATA = {
  NAME: 'FHEdback',
  DESCRIPTION: 'Privacy-first survey platform using Fully Homomorphic Encryption',
  VERSION: '1.0.0',
  AUTHOR: 'FHEdback Team',
  WEBSITE: 'https://fhedback.com',
  GITHUB: 'https://github.com/fhedback/fhedback',
  DISCORD: 'https://discord.gg/fhedback',
  TWITTER: 'https://twitter.com/fhedback',
} as const

// Feature Flags
export const FEATURES = {
  ADVANCED_MODE: true,
  ANALYTICS: false,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  BETA_FEATURES: false,
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  CREATOR: '/creator',
  CREATOR_NEW: '/creator/new',
  CREATOR_ANALYTICS: '/creator/analytics', 
  RESPONDENT: '/respondent',
  RESPONDENT_REWARDS: '/respondent/rewards',
  SURVEY: '/survey',
  SURVEY_RESULTS: '/survey/$surveyId/results',
  ABOUT: '/about',
  DOCS: '/docs',
} as const

// Default Form Values
export const DEFAULT_FORM_VALUES = {
  symbol: '',
  respondentLimit: SURVEY_LIMITS.RESPONDENT_LIMIT_DEFAULT,
  metadata: {
    title: '',
    description: '',
    instructions: '',
    category: SURVEY_CATEGORIES.PRODUCT_FEEDBACK as SurveyCategory,
    language: 'en',
    tags: [] as string[],
  },
  questions: [''],
} as const

// Animation Durations (in ms)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const
