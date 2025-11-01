import type { 
  DescriptiveStats, 
  ComputedStats, 
  FrequencyDistribution 
} from '../types/survey-stats'

/**
 * Get the range (min and max) from frequency distribution
 */
export function getFrequencyRange(frequencies: Record<string, number>): { 
  min: number | null; 
  max: number | null 
} {
  const keys = Object.keys(frequencies)
    .map(Number)
    .sort((a, b) => a - b)

  let min: number | null = null
  let max: number | null = null

  for (const key of keys) {
    if (frequencies[key] > 0) {
      if (min === null) min = key
      max = key
    }
  }

  return { min, max }
}

/**
 * Calculate statistics from descriptive stats and total respondents
 */
export function calculateStats(
  descriptive: DescriptiveStats,
  totalRespondents: number,
  frequencies: Record<number, number> | undefined,
  maxScore: number
): ComputedStats {
  const N = totalRespondents

  let mean = 0
  let stdDev = 0
  let minValue = 0
  let maxValue = 0

  if (descriptive && N > 0) {
    mean = descriptive.totalScore / N
    const variance = descriptive.sumSquares / N - mean * mean
    stdDev = Math.sqrt(Math.max(variance, 0))

    // Calculate min/max from frequencies if available
    if (frequencies) {
      const range = getFrequencyRange(frequencies)
      minValue = range.min ?? 0
      maxValue = range.max ?? 0
    }
  }

  const topBoxPercentage = N && frequencies ? 
    (frequencies[maxScore] / N) * 100 : 0

  return {
    respondents: N,
    mean,
    stdDev,
    minValue,
    maxValue,
    topBoxPercentage
  }
}

/**
 * Prepare frequency distribution data for visualization
 */
export function prepareFrequencyDistribution(
  frequencies: Record<number, number>,
  totalRespondents: number
): FrequencyDistribution[] {
  const maxFreq = Math.max(1, ...Object.values(frequencies))

  return Object.keys(frequencies)
    .map(Number)
    .sort((a, b) => a - b)
    .map((value) => {
      const count = frequencies[value]
      const percentage = totalRespondents ? (count / totalRespondents) * 100 : 0
      const relativeWidth = (count / maxFreq) * 100

      return {
        value,
        count,
        percentage,
        relativeWidth
      }
    })
}

/**
 * Parse decryption results to numeric values
 */
export function parseDecryptedDescriptive(
  decryptedData: Record<string, string | bigint | boolean> | null,
  descriptiveHandles: string[]
): DescriptiveStats {
  if (!decryptedData) {
    return {
      totalScore: 0,
      sumSquares: 0,
      minScore: 0,
      maxScore: 0
    }
  }

  return {
    totalScore: Number(decryptedData[descriptiveHandles[0]] ?? 0),
    sumSquares: Number(decryptedData[descriptiveHandles[1]] ?? 0),
    minScore: Number(decryptedData[descriptiveHandles[2]] ?? 0),
    maxScore: Number(decryptedData[descriptiveHandles[3]] ?? 0)
  }
}

/**
 * Parse decrypted frequencies to numeric values
 */
export function parseDecryptedFrequencies(
  decryptedData: Record<string, string | bigint | boolean> | null,
  frequencyHandles: string[]
): Record<number, number> {
  const result: Record<number, number> = {}

  if (!decryptedData) return result

  frequencyHandles.forEach((handle, index) => {
    result[index + 1] = Number(decryptedData[handle] ?? 0)
  })

  return result
}
