// Route file: /survey/view/$addr.tsx

import { createFileRoute } from '@tanstack/react-router'
import type { Abi, Address } from 'viem'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { useFhevmContext } from '../services/fhevm/useFhevmContext'
import { useAccount, useWriteContract } from 'wagmi'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { ABIS } from '../services/contracts'
import { bytesToHex } from 'viem'

export const Route = createFileRoute('/survey/view/$addr')({
  component: RouteComponent,
})

type SurveyResponse = { [questionId: number]: number }

const surveyAbi = ABIS.survey as Abi

function RouteComponent() {
  const { addr } = Route.useParams()
  const account = useAccount()
  const { instance: fhe, status: fheStatus } = useFhevmContext()
  const { config, metadata, questions } = useSurveyDataByAddress(addr as Address)
  const { writeContractAsync } = useWriteContract()

  const [responses, setResponses] = useState<SurveyResponse>({})
  const [state, setState] = useState<'idle' | 'encrypting' | 'submitting' | 'submitted'>('idle')

  const progress = useMemo(() => {
    if (!questions?.length) return 0
    return (Object.keys(responses).length / questions.length) * 100
  }, [responses, questions])

  const handleRating = (qid: number, rating: number) =>
    setResponses((prev) => ({ ...prev, [qid]: rating }))

  const buttonText = useMemo(() => ({
    idle: 'Submit Survey',
    encrypting: 'Encrypting Responses...',
    submitting: 'Submitting Survey...',
    submitted: 'Survey Submitted',
  })[state], [state])

  const encryptResponses = useCallback(async () => {
    if (!fhe || fheStatus !== 'ready') throw new Error("FHEVM not ready")
    const buffer = fhe.createEncryptedInput(addr, account.address!)
    Object.values(responses).forEach(rating => buffer.add8(BigInt(rating)))
    return await buffer.encrypt()
  }, [fhe, fheStatus, addr, account.address, responses])

  const handleSubmit = async () => {
    try {
      console.log("Encrypting survey responses...")
      const ciphertexts = await encryptResponses()
      console.log('Encrypted survey data:', ciphertexts)

      const payload = {
        responses: ciphertexts.handles.map((handle) => bytesToHex(handle)),
        inputProof: bytesToHex(ciphertexts.inputProof),
      }

      setState('submitting')
      console.log("Submitting survey responses to the blockchain...")
      const tx = await writeContractAsync({
        address: addr as Address,
        abi: surveyAbi,
        functionName: 'submitResponses',
        args: [payload.responses, payload.inputProof],
      })

      if (tx) {
        toast.success('Survey submitted successfully! TX Hash: ' + tx)
        setState('submitted')
      } else {
        throw new Error('Transaction failed')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error('Failed to encrypt: ' + err.message)
      console.log('Error during survey submission:', err)
      setState('idle')
    }
  }

  if (!config || !metadata || !questions) {
    return (
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-b-2 border-border rounded-full mx-auto" />
          <p>Loading survey...</p>
        </div>
      </main>
    )
  }

  if (state === 'submitted') {
    return (
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Terima kasih!</h2>
              <p className="text-muted-foreground">Survey telah berhasil dikirim</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <>
      <div className="h-64 bg-main" />
      <main className="container mx-auto -mt-40 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Survey Header */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-4xl">{metadata.title}</CardTitle>
                  <CardDescription className="text-subtle italic">{metadata.description || "Silakan isi survey berikut"}</CardDescription>
                </div>
                <Badge>{metadata.category}</Badge>
              </div>
              <div className="space-y-2 pt-4">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  Progress: {Object.keys(responses).length} / {questions.length} questions
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Survey Questions */}
          {questions.map((q, i) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { minScore = 1, maxScore = 5, minLabel = 'Sangat Tidak Setuju', maxLabel = 'Sangat Setuju' } = q.response as any
            const selected = responses[q.id]

            return (
              <Card key={q.id} className={`bg-white ${selected ? 'ring-2 ring-main/20' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl flex gap-3 items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${selected ? 'bg-main' : 'bg-muted-foreground/60'}`}>
                      {selected ? '✓' : i + 1}
                    </div>
                    {q.text}
                  </CardTitle>
                  {q.helperText && <p className="text-xs italic text-subtle">{q.helperText}</p>}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-base">{minLabel}</span>
                    <div className="flex gap-2">
                      {Array.from({ length: maxScore - minScore + 1 }, (_, i) => {
                        const score = minScore + i
                        const isSelected = selected === score
                        return (
                          <Button
                            key={score}
                            onClick={() => handleRating(q.id, score)}
                            variant={isSelected ? "default" : "neutral"}
                            size="icon"
                            className={`w-14 h-14 rounded-full font-bold text-lg ${isSelected ? 'ring-2 ring-offset-2 ring-main/50' : ''}`}
                          >
                            {score}
                          </Button>
                        )
                      })}
                    </div>
                    <span>{maxLabel}</span>
                  </div>
                  {selected && (
                    <div className="text-center">
                      <Badge variant="neutral" className="animate-pulse">
                        Rating: {selected}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Submit Actions */}
          {Object.keys(responses).length === questions.length && (
            <div className="flex justify-between">
              <Button
                variant="neutral"
                onClick={() => setResponses({})}
                className="w-full max-w-xs"
              >
                Reset Answers
              </Button>
              <Button
                onClick={() => {
                  setState('encrypting')
                  setTimeout(handleSubmit, 500)
                }}
                disabled={state === 'encrypting' || state === 'submitting'}
                className="w-full max-w-xs"
              >
                {state === 'encrypting' && <Lock className="w-4 h-4 mr-2 animate-spin" />}
                {state === 'submitting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
