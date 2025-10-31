import { createFileRoute } from '@tanstack/react-router'
import type { Address } from 'viem'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'


export const Route = createFileRoute('/survey/view/$addr')({
  component: RouteComponent,
})

type SurveyResponse = {
  [questionId: number]: number
}

function RouteComponent() {
  const params = Route.useParams()

  const addr = params.addr as Address
  const {
    config,
    metadata,
    questions,
  } = useSurveyDataByAddress(addr)

  const [responses, setResponses] = useState<SurveyResponse>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRating = (questionId: number, rating: number) => {
    setResponses(prev => ({ ...prev, [questionId]: rating }))
  }

  const handleSubmit = async () => {
    console.log('Survey responses:', responses)
    setIsSubmitted(true)
  }

  const progress = useMemo(
    () => {
      if (!questions || questions.length === 0) return 0
      return (Object.keys(responses).length / questions.length) * 100
    },
    [responses, questions]
  )


  if (!config || !metadata || !questions) {
    return (
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4"></div>
          <p>Loading survey...</p>
        </div>
      </main>
    )
  }

  if (isSubmitted) {
    return (
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-6">
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
      <div className='h-64 bg-main'></div>
      <main className="container mx-auto -mt-40 pb-16">

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className='w-full text-center'></div>
          <Card className='bg-white'>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-4xl font-heading mb-2">{metadata.title}</CardTitle>
                  <CardDescription className="mb-4 text-subtle font-light italic">
                    {metadata.description || "Silakan isi survey berikut"}
                  </CardDescription>
                </div>
                <Badge>{metadata.category}</Badge>

              </div>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Progress: {Object.keys(responses).length} of {questions.length} questions
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Questions */}
          {questions.map((question, index) => {
            const responseData = question.response as Record<string, unknown>
            const minScore = (responseData.minScore as number) || 1
            const maxScore = (responseData.maxScore as number) || 5
            const minLabel = (responseData.minLabel as string) || 'Sangat Tidak Setuju'
            const maxLabel = (responseData.maxLabel as string) || 'Sangat Setuju'
            const isAnswered = question.id in responses

            return (
              <Card key={question.id} className={isAnswered ? 'bg-white ring-2 ring-main/20' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${isAnswered ? 'bg-main' : 'bg-muted-foreground/60'
                      }`}>
                      {isAnswered ? '✓' : index + 1}
                    </div>
                    <h3 className='text-2xl'> {question.text}</h3>
                    {question.helperText && (
                      <p className="text-xs text-subtle italic">{question.helperText}</p>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center text-sm">
                    <div className='text-base'>{minLabel}</div>
                    <div className="flex gap-2 justify-center">
                      {Array.from({ length: maxScore - minScore + 1 }, (_, i) => {
                        const score = minScore + i
                        const isSelected = responses[question.id] === score

                        return (
                          <Button
                            key={score}
                            onClick={() => handleRating(question.id, score)}
                            variant={isSelected ? "default" : "neutral"}
                            size="icon"
                            className={`w-14 h-14 rounded-full font-bold text-lg ${isSelected ? 'ring-2 ring-offset-2 ring-main/50' : ''
                              }`}
                          >
                            {score}
                          </Button>
                        )
                      })}
                    </div>
                    <span>{maxLabel}</span>
                  </div>



                  {isAnswered && (
                    <div className="text-center">
                      <Badge variant="neutral" className="animate-pulse">
                        Rating: {responses[question.id]}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Submit */}
          {Object.keys(responses).length === questions.length && (
            <div className="flex justify-between">
              {/* Reset Button */}
              <Button
                variant="neutral"
                onClick={() => setResponses({})}
                size="lg"
                className="w-full max-w-xs"
              >
                Reset Answers
              </Button>



              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full max-w-xs"
              >
                Submit Responses
              </Button>
            </div>
          )}
        </div>
      </main>
    </>

  )
}
