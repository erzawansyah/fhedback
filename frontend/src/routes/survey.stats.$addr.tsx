import React, { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Address } from 'viem'

// UI
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2 } from 'lucide-react'

// Hooks / services
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { useFheDecryption } from '../services/fhevm/useFhevmContext'
import { ABIS } from '../services/contracts'
import { useReadContracts, useWriteContract } from 'wagmi'
import { toast } from 'sonner'

const surveyAbi = ABIS.survey

export const Route = createFileRoute('/survey/stats/$addr')({
  component: RouteComponent,
})

/* ----------------------------- Types -------------------------------- */

type QuestionType = {
  index: number
  text: string
  helperText?: string
  contractAddress?: Address
}

type EncryptedState = {
  totalRespondents: number
  totalScore: string
  sumSquares: string
  minScore: string
  maxScore: string
  questionFrequencies: { [key: number]: string }
}

/* --------------------------- Route Component ------------------------- */

function RouteComponent() {
  const addr = Route.useParams().addr as Address
  const { questions } = useSurveyDataByAddress(addr)


  return (
    <>
      <div className="h-64 bg-main" />
      <main className="container mx-auto -mt-32 pb-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="bg-white">
            <CardContent>
              <h4 className="text-2xl">Survey Insights & Trends</h4>
              <p className="mt-2 text-sm text-gray-700">
                Dive into responses by respondent, by question, or view the big-picture summary — reveal
                individual answers, spot trends per question, and get a clear snapshot of overall
                results.
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Tip: Grant decryption access in your survey settings to unlock detailed,
              </p>
            </CardContent>

          </Card>

          {questions?.map((q, i) => (
            <QuestionStatCard
              key={i}
              index={i}
              text={q.text}
              helperText={q.helperText}
              contractAddress={addr}
            />
          ))}
        </div>
      </main>
    </>
  )
}

/* -------------------------- Question Card ---------------------------- */

const QuestionStatCard: React.FC<QuestionType> = ({ index, text, helperText, contractAddress }) => {
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [decryptedData, setDecryptedData] = useState<{
    descriptive: number[]
    frequencies?: number[]
  } | null>(null)

  const { data: qStats } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: surveyAbi, functionName: 'totalRespondents' },
      { address: contractAddress, abi: surveyAbi, functionName: 'getQuestionStatistics', args: [index] },
      { address: contractAddress, abi: surveyAbi, functionName: 'getQuestionFrequencies', args: [index] },
    ],
  })

  const stats = useMemo<EncryptedState | null>(() => {
    if (!qStats) return null
    // qStats is expected to be an array of read results. We defensively extract.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [totalRespondentsR, questionStatsR, questionFreqsR] = qStats as any[]

    const freqResult: { [key: number]: string } = {}
    const freqArray = questionFreqsR?.result ?? []
    for (let i = 0; i < freqArray.length; i++) freqResult[i + 1] = String(freqArray[i])

    const prepared: EncryptedState = {
      totalRespondents: Number(totalRespondentsR?.result ?? 0),
      totalScore: String(questionStatsR?.result?.total ?? '0'),
      sumSquares: String(questionStatsR?.result?.sumSquares ?? '0'),
      minScore: String(questionStatsR?.result?.minScore ?? '0'),
      maxScore: String(questionStatsR?.result?.maxScore ?? '0'),
      questionFrequencies: freqResult,
    }

    // helpful for debugging while data shapes are unstable
    // console.debug('Prepared stats:', prepared)
    return prepared
  }, [qStats])

  return (
    <Card className="bg-secondary-background">
      <CardContent>
        <div className="flex items-center space-x-3 mb-2">
          <Badge>{`Q${index !== undefined ? index + 1 : ''}`}</Badge>
          <h4 className="text-lg font-medium">{text}</h4>
        </div>

        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

        {/* Show decrypt button when stats available; otherwise a lightweight loading state */}
        {!stats ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading stats…</p>
        ) : !isDecrypted ? (
          <DecryptedButton
            index={index}
            stats={stats}
            addr={contractAddress as Address}
            onDecrypted={(payload) => {
              setDecryptedData(payload)
              setIsDecrypted(true)
            }}
          />
        ) : (
          <Details stats={stats} decrypted={decryptedData} />
        )}
      </CardContent>
    </Card>
  )
}

/* -------------------------- Decryption CTA -------------------------- */

type DecryptedPayload = {
  descriptive: number[]
  frequencies?: number[]
}

const DecryptedButton: React.FC<{
  index: number
  stats: EncryptedState
  addr: Address
  onDecrypted: (payload: DecryptedPayload) => void
}> = ({ index, stats, addr, onDecrypted }) => {
  const { userDecrypt } = useFheDecryption()
  const { writeContractAsync } = useWriteContract()
  const [isProcessing, setIsProcessing] = useState(false)

  const descriptive = useMemo(() => [stats.totalScore, stats.sumSquares, stats.minScore, stats.maxScore], [stats])
  const frequencyScore = useMemo(() => Object.values(stats.questionFrequencies), [stats])

  const grantAccess = async () => {
    try {
      await writeContractAsync({
        address: addr,
        abi: surveyAbi,
        functionName: 'grantOwnerDecrypt',
        args: [index],
      })
      toast.success('Decryption access granted')
    } catch (err) {
      toast.error('Failed to grant decryption access: ' + String(err))
      throw err
    }
  }

  const handleDecrypt = async () => {
    setIsProcessing(true)
    try {
      await grantAccess()

      // Call decrypt for descriptive stats and frequencies. The decryption implementation must
      // handle array inputs and return meaningful data for the UI to consume.
      const decryptedResponses = await userDecrypt(descriptive, addr)
      const decryptedFrequencies = await userDecrypt(frequencyScore, addr)

      // Normalize results to numbers
      const parsedDescriptive = Array.isArray(decryptedResponses) ? decryptedResponses.map(Number) : []
      const parsedFrequencies = Array.isArray(decryptedFrequencies) ? decryptedFrequencies.map(Number) : undefined

      console.debug('Decrypted descriptive:', parsedDescriptive)
      console.debug('Decrypted frequencies:', parsedFrequencies)

      onDecrypted({ descriptive: parsedDescriptive, frequencies: parsedFrequencies })
      toast.success('Responses decrypted')
    } catch (err) {
      toast.error('Failed to decrypt responses: ' + String(err))
      console.error('Error decrypting responses:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button onClick={handleDecrypt} disabled={isProcessing}>
      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isProcessing ? 'Decrypting…' : 'Decrypt Responses'}
    </Button>
  )
}

/* ----------------------------- Details --------------------------------
   This is a local, presentational component showing summary statistics and a
   static example distribution. Replace the hard-coded `freqs` with real
   decrypted frequency data when available.
 */

const Details: React.FC<{ stats: EncryptedState; decrypted: { descriptive: number[]; frequencies?: number[] } | null }> = ({ stats, decrypted }) => {
  // When decrypted frequencies are available prefer them. Otherwise fall back to
  // computing KPIs from descriptive stats + totalRespondents (if available)
  const maxScore = 5

  const freqsFromDecrypted = decrypted?.frequencies && decrypted.frequencies.length > 0 ? decrypted.frequencies : undefined
  const freqsFallback = [5, 18, 42, 40, 23]
  const freqs = freqsFromDecrypted ?? freqsFallback

  const N = freqs.reduce((a, b) => a + b, 0)

  // If we have descriptive decrypted values, use them where possible. Expected order:
  // [totalScore, sumSquares, minScore, maxScore]
  const descriptive = decrypted?.descriptive ?? []
  const totalScoreFromDescriptive = descriptive.length > 0 ? descriptive[0] : undefined
  const sumSquaresFromDescriptive = descriptive.length > 1 ? descriptive[1] : undefined

  // Compute mean/std using frequencies when available, otherwise fall back to descriptive + stats.totalRespondents
  let mean = 0
  let stdDev = 0

  if (freqsFromDecrypted) {
    const sum = freqs.reduce((acc, cnt, i) => acc + cnt * (i + 1), 0)
    const sumSq = freqs.reduce((acc, cnt, i) => acc + cnt * Math.pow(i + 1, 2), 0)
    mean = N ? sum / N : 0
    const variance = N ? sumSq / N - mean * mean : 0
    stdDev = Math.sqrt(Math.max(variance, 0))
  } else if (typeof totalScoreFromDescriptive !== 'undefined' && typeof sumSquaresFromDescriptive !== 'undefined' && stats.totalRespondents > 0) {
    mean = totalScoreFromDescriptive / stats.totalRespondents
    const variance = sumSquaresFromDescriptive / stats.totalRespondents - mean * mean
    stdDev = Math.sqrt(Math.max(variance, 0))
  }

  const firstIdx = freqs.findIndex((c) => c > 0)
  const lastIdxFromEnd = [...freqs].reverse().findIndex((c) => c > 0)
  const minVal = firstIdx === -1 ? 0 : firstIdx + 1
  const maxVal = lastIdxFromEnd === -1 ? 0 : maxScore - lastIdxFromEnd

  const topBoxPct = N ? (freqs[maxScore - 1] / N) * 100 : 0
  const maxFreq = Math.max(1, ...freqs)

  return (
    <>
      <p className="font-light italic text-xs mt-4 mb-1">Responses:</p>
      <div className="space-x-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Respondents</div>
            <div className="text-base font-semibold tabular-nums">{N}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Mean</div>
            <div className="text-base font-semibold tabular-nums">{mean.toFixed(2)}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Std Dev</div>
            <div className="text-base font-semibold tabular-nums">{stdDev.toFixed(2)}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Min–Max</div>
            <div className="text-base font-semibold tabular-nums">{minVal}–{maxVal}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Top-box</div>
            <div className="text-base font-semibold tabular-nums">{topBoxPct.toFixed(1)}%</div>
          </div>
        </div>

        {/* Distribusi hanya ditampilkan bila freqs tersedia */}
        {freqsFromDecrypted ? (
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Answer Distribution</p>
              <p className="text-xs text-muted-foreground">Scale 1–{maxScore}</p>
            </div>

            <div className="space-y-2">
              {freqs.map((count, idx) => {
                const value = idx + 1
                const pct = N ? (count / N) * 100 : 0
                const rel = (count / maxFreq) * 100
                return (
                  <div key={value} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-1 text-xs font-medium text-muted-foreground">{value}</div>
                    <div className="col-span-9">
                      <div className="h-2 rounded bg-muted">
                        <div
                          className="h-2 rounded bg-primary transition-[width]"
                          style={{ width: `${rel}%` }}
                          aria-label={`Value ${value} bar`}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right text-xs tabular-nums">
                      {count}{N ? ` • ${pct.toFixed(1)}%` : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Answer distribution is not available. Grant decrypt access to see per-value frequencies.</p>
          </div>
        )}
      </div>
    </>
  )
}


