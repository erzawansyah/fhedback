// Route file: /survey/view/$addr.tsx

import { createFileRoute, Link } from '@tanstack/react-router'
import type { Address } from 'viem'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { ArrowRightCircle, Loader2, Lock, StopCircle } from 'lucide-react'
import { useSurveyView } from '../hooks/useSurveyView'
import { useSurveySubmission } from '../hooks/useSurveySubmission'
import QuestionCard from '../components/QuestionCard'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import QuestionCardPreview from '../components/QuestionCardPreview'

export const Route = createFileRoute('/survey/view/$addr')({
  component: RouteComponent,
})

function RouteComponent() {
  const { addr } = Route.useParams()
  const { data, account, hasResponded, isActive, isOwner } = useSurveyView(addr as Address)
  const { config, metadata, questions } = data
  const { state, responses, handleRating, resetResponses, handleSubmit, closeSurvey } = useSurveySubmission(addr as Address, account.address as Address)

  const progress = useMemo(() => {
    if (!questions?.length) return 0
    return (Object.keys(responses).length / questions.length) * 100
  }, [responses, questions])

  const buttonText = useMemo(() => ({
    idle: 'Submit Survey',
    encrypting: 'Encrypting Responses...',
    submitting: 'Submitting Survey...',
    submitted: 'Survey Submitted',
  })[state], [state])

  if (!isActive) {
    return (
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="space-y-6">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Survey Closed</h1>
              <p className="text-lg text-muted-foreground mb-4">
                This survey is no longer accepting responses. It has been closed and all responses have been collected.
              </p>
              <p className="text-base text-muted-foreground">
                However, you can still view the survey results and statistics compiled from all participants' responses.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button className="mt-6" asChild>
                <Link to="/survey/stats/$addr" params={{ addr }}>
                  View Survey Results & Statistics
                  <ArrowRightCircle className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="neutral" asChild>
                <Link to="/surveys/explore">
                  Explore Other Surveys
                  <ArrowRightCircle className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </main>
    )
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

  return (
    <>
      <div className="h-64 bg-main" />
      <main className="container mx-auto -mt-40 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title={metadata.title}
            description={metadata.description}
            category={metadata.category}
            progress={progress}
            answered={Object.keys(responses).length}
            totalQuestions={questions.length}
          />

          {hasResponded && (
            <Alert>
              <StopCircle className="w-4 h-4 mr-2" />
              <AlertTitle>You have already submitted responses for this survey.</AlertTitle>
              <AlertDescription>
                Thank you for your participation! Multiple submissions are not allowed.
              </AlertDescription>
            </Alert>
          )}

          {isOwner && (
            <Alert>
              <StopCircle className="w-4 h-4 mr-2" />
              <AlertTitle>You are the owner of this survey.</AlertTitle>
              <AlertDescription>
                You can edit or close the survey at any time.
              </AlertDescription>
            </Alert>
          )}

          {/* Survey Questions */}
          {questions.map((q, i) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { minScore = 1, maxScore = 5, minLabel = 'Strongly Disagree', maxLabel = 'Strongly Agree' } = q.response as any
            const selected = responses[q.id]

            if (!hasResponded && !isOwner) {
              return (
                <QuestionCard
                  key={q.id}
                  index={i}
                  question={q}
                  score={{
                    min: minScore,
                    max: maxScore,
                    minLabel,
                    maxLabel
                  }}
                  selected={selected}
                  handleRating={handleRating}
                />
              )
            } else {
              return (
                <QuestionCardPreview
                  key={q.id}
                  index={i}
                  question={q}
                  score={{
                    min: minScore,
                    max: maxScore,
                    minLabel,
                    maxLabel
                  }}
                />
              )
            }
          })}

          {/* Submit Actions (Only for Respondents) */}
          {!hasResponded && !isOwner && Object.keys(responses).length === questions.length && (
            <div className="flex justify-between">
              <Button
                variant="neutral"
                onClick={resetResponses}
                className="w-full max-w-xs"
              >
                Reset Answers
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={state === 'encrypting' || state === 'submitting'}
                className="w-full max-w-xs"
              >
                {state === 'encrypting' && <Lock className="w-4 h-4 mr-2 animate-spin" />}
                {state === 'submitting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {buttonText}
              </Button>
            </div>
          )}

          {isOwner && <CloseSurveyButton handleClose={closeSurvey} />}
        </div>
      </main>
    </>
  )
}


type PageHeaderProps = {
  title: string;
  description?: string;
  category: string;
  progress: number;
  answered: number;
  totalQuestions: number;
}

const PageHeader = ({
  title,
  description,
  category,
  progress,
  answered,
  totalQuestions
}: PageHeaderProps) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-4xl">{title}</CardTitle>
            <CardDescription className="text-subtle italic">{description || "Silakan isi survey berikut"}</CardDescription>
          </div>
          <Badge>{category}</Badge>
        </div>
        <div className="space-y-2 pt-4">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Progress: {answered} / {totalQuestions} questions
          </p>
        </div>
      </CardHeader>
    </Card>
  )
}

const CloseSurveyButton = ({ handleClose }: { handleClose: (onSuccess?: () => void) => void }) => {
  const [state, setState] = useState<'idle' | 'closing' | 'closed'>('idle')

  const handleClick = () => {
    setState('closing')
    handleClose(() => {
      setState('closed')
    })
  }


  return (
    <Button variant="neutral" asChild className="w-full max-w-xs" onClick={handleClick}>
      <span>
        {state === 'idle' && 'Close Survey'}
        {state === 'closing' && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Closing Survey...
          </>
        )}
        {state === 'closed' && 'Survey Closed'}
      </span>
    </Button>
  )
}
