import { useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { ABIS } from '../services/contracts'
import type { EncryptedQuestionStats } from '../types/survey-stats'

const surveyAbi = ABIS.survey

/**
 * Hook to fetch encrypted question statistics from contract
 */
export function useQuestionStats(
  contractAddress: Address | undefined,
  questionIndex: number
) {
  const { data: qStats, isLoading, error } = useReadContracts({
    contracts: contractAddress ? [
      { 
        address: contractAddress, 
        abi: surveyAbi, 
        functionName: 'totalRespondents' 
      },
      { 
        address: contractAddress, 
        abi: surveyAbi, 
        functionName: 'getQuestionStatistics', 
        args: [questionIndex] 
      },
      { 
        address: contractAddress, 
        abi: surveyAbi, 
        functionName: 'getQuestionFrequencies', 
        args: [questionIndex] 
      },
    ] : undefined,
  })

  const stats = useMemo<EncryptedQuestionStats | null>(() => {
    if (!qStats) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [totalRespondentsR, questionStatsR, questionFreqsR] = qStats as any[]

    const freqResult: Record<number, string> = {}
    const freqArray = questionFreqsR?.result ?? []
    
    for (let i = 0; i < freqArray.length; i++) {
      freqResult[i + 1] = String(freqArray[i])
    }

    return {
      totalRespondents: Number(totalRespondentsR?.result ?? 0),
      totalScore: String(questionStatsR?.result?.total ?? '0'),
      sumSquares: String(questionStatsR?.result?.sumSquares ?? '0'),
      minScore: String(questionStatsR?.result?.minScore ?? '0'),
      maxScore: String(questionStatsR?.result?.maxScore ?? '0'),
      questionFrequencies: freqResult,
    }
  }, [qStats])

  return {
    stats,
    isLoading,
    error,
    maxScore: stats ? Object.keys(stats.questionFrequencies).length : 0
  }
}
