import type { Address } from 'viem'

/**
 * Represents a question with its metadata for statistics display
 */
export interface QuestionStats {
  index: number
  text: string
  helperText?: string
  contractAddress?: Address
}

/**
 * Encrypted state of question statistics as returned from contracts
 */
export interface EncryptedQuestionStats {
  totalRespondents: number
  totalScore: string
  sumSquares: string
  minScore: string
  maxScore: string
  questionFrequencies: Record<number, string>
}

/**
 * Descriptive statistics after decryption
 */
export interface DescriptiveStats {
  totalScore: number
  sumSquares: number
  minScore: number
  maxScore: number
}

/**
 * Decrypted statistics payload
 */
export interface DecryptedQuestionStats {
  descriptive: DescriptiveStats
  frequencies?: Record<number, number>
}

/**
 * Computed statistics for display
 */
export interface ComputedStats {
  respondents: number
  mean: number
  stdDev: number
  minValue: number
  maxValue: number
  topBoxPercentage: number
}

/**
 * Frequency distribution data for charts
 */
export interface FrequencyDistribution {
  value: number
  count: number
  percentage: number
  relativeWidth: number
}
