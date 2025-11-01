import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useMemo, useState } from 'react'
import type { Address } from 'viem'

import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import QuestionCard from '../components/QuestionCard'
import QuestionCardPreview from '../components/QuestionCardPreview'

import { ArrowRightCircle, Loader2, Lock, StopCircle } from 'lucide-react'

import { useSurveySubmission } from '../hooks/useSurveySubmission'
import { useSurveyView } from '../hooks/useSurveyView'
import { WalletGuard } from '../components/WalletGuard'

export const Route = createFileRoute('/survey/view/$addr')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <WalletGuard>
      <SurveyViewPage />
    </WalletGuard>
  )
}

function SurveyViewPage() {
  const { addr } = Route.useParams()
  const { data, account, hasResponded, isActive, isOwner, totalRespondent } =
    useSurveyView(addr as Address)

  const { config, metadata, questions } = data
  const {
    state,
    responses,
    storedResponse,
    handleRating,
    resetResponses,
    handleSubmit,
    closeSurvey,
    revealResponses,
  } = useSurveySubmission(addr as Address, account.address as Address)

  const progress = useMemo(() => {
    if (isOwner) {
      if (!config || !config.respondentLimit) return 0
      return (totalRespondent / config.respondentLimit) * 100
    }
    if (!questions?.length) return 0
    return (Object.keys(responses).length / questions.length) * 100
  }, [responses, questions, isOwner, config, totalRespondent])

  const buttonText = useMemo(
    () =>
      ({
        idle: 'Submit Survey',
        encrypting: 'Encrypting Responses...',
        submitting: 'Submitting Survey...',
        submitted: 'Survey Submitted',
      } as const)[state],
    [state],
  )

  if (!isActive) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="space-y-6">
            <Lock className="mx-auto h-16 w-16 text-muted-foreground" />
            <div>
              <h1 className="mb-2 text-2xl md:text-3xl font-bold">Survey Closed</h1>
              <p className="mb-4 text-base md:text-lg text-muted-foreground px-4">
                This survey is no longer accepting responses. It has been closed and all responses
                have been collected.
              </p>
              <p className="text-sm md:text-base text-muted-foreground px-4">
                However, you can still view the survey results and statistics compiled from all
                participants&apos; responses.
              </p>
            </div>
            <div className="flex flex-col gap-4 px-4">
              <Button className="mt-6" asChild>
                <Link to="/survey/stats/$addr" params={{ addr }}>
                  View Survey Results & Statistics
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="neutral" asChild>
                <Link to="/surveys/explore">
                  Explore Other Surveys
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
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
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-border" />
          <p>Loading survey...</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <div className="h-40 md:h-64 bg-main" />
      <main className="container mx-auto -mt-32 md:-mt-40 pb-16 px-4">
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
          {isOwner ? (
            <OwnerPageHeader
              title={metadata.title}
              description={metadata.description}
              category={metadata.category}
              progress={progress}
              currentRespondent={totalRespondent}
              maxRespondent={config.respondentLimit}
            />
          ) : (
            <PageHeader
              title={metadata.title}
              description={metadata.description}
              category={metadata.category}
              progress={progress}
              answered={Object.keys(responses).length}
              totalQuestions={questions.length}
            />
          )}

          {hasResponded && (
            <Alert>
              <StopCircle className="mr-2 h-4 w-4" />
              <AlertTitle>You have already submitted responses for this survey.</AlertTitle>
              <AlertDescription>
                Thank you for your participation! Multiple submissions are not allowed.
              </AlertDescription>
            </Alert>
          )}

          {isOwner && (
            <Alert>
              <StopCircle className="mr-2 h-4 w-4" />
              <AlertTitle>You are the owner of this survey.</AlertTitle>
              <AlertDescription>You can edit or close the survey at any time.</AlertDescription>
            </Alert>
          )}

          {/* Survey Questions */}
          {questions.map((q, i) => {
            const {
              minScore = 1,
              maxScore = 5,
              minLabel = 'Strongly Disagree',
              maxLabel = 'Strongly Agree',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } = (q.response as any) || {}

            const selected = responses[q.id]

            if (!hasResponded && !isOwner) {
              return (
                <QuestionCard
                  key={q.id}
                  index={i}
                  question={q}
                  score={{ min: minScore, max: maxScore, minLabel, maxLabel }}
                  selected={selected}
                  handleRating={handleRating}
                />
              )
            }

            return (
              <QuestionCardPreview
                key={q.id}
                index={i}
                question={q}
                score={{ min: minScore, max: maxScore, minLabel, maxLabel }}
                storedResponse={storedResponse !== null ? storedResponse[i] : undefined}
              />
            )
          })}

          {/* Submit Actions (Only for Respondents) */}
          {!hasResponded &&
            !isOwner &&
            Object.keys(responses).length === questions.length && (
              <SubmitResponsesButton
                state={state}
                buttonText={buttonText}
                handleSubmit={handleSubmit}
                resetResponses={resetResponses}
              />
            )}

          {/* Close Survey Button (Only for Owner) */}
          {isOwner && <CloseSurveyButton handleClose={closeSurvey} />}

          {/* Reveal Responses Button (Only for non owner who have responded) */}
          {!isOwner && hasResponded && (
            <RevealResponsesButton handleReveal={() => revealResponses()} />
          )}
        </div>
      </main>
    </>
  )
}

/* ----------------------------- Page Headers ----------------------------- */

type PageHeaderProps = {
  title: string
  description?: string
  category: string
  progress: number
  answered: number
  totalQuestions: number
}

const PageHeader = ({
  title,
  description,
  category,
  progress,
  answered,
  totalQuestions,
}: PageHeaderProps) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div className="flex-1 w-full">
            <CardTitle className="text-2xl md:text-4xl wrap-break-word">{title}</CardTitle>
            <CardDescription className="text-subtle italic text-sm md:text-base">
              {description || 'Silakan isi survey berikut'}
            </CardDescription>
          </div>
          <Badge className="self-start">{category}</Badge>
        </div>

        <div className="pt-4 space-y-2">
          <Progress value={progress} />
          <p className="text-xs md:text-sm text-muted-foreground">
            Progress: {answered} / {totalQuestions} questions
          </p>
        </div>
      </CardHeader>
    </Card>
  )
}

type OwnerPageHeaderProps = {
  title: string
  description?: string
  category: string
  progress: number
  currentRespondent: number
  maxRespondent: number
}

const OwnerPageHeader = ({
  title,
  description,
  category,
  progress,
  currentRespondent,
  maxRespondent,
}: OwnerPageHeaderProps) => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div className="flex-1 w-full">
            <CardTitle className="text-2xl md:text-4xl wrap-break-word">{title}</CardTitle>
            <CardDescription className="text-subtle italic text-sm md:text-base">
              {description || 'Silakan isi survey berikut'}
            </CardDescription>
          </div>
          <Badge className="self-start">{category}</Badge>
        </div>

        <div className="pt-4 space-y-2">
          <Progress value={progress} />
          <p className="text-xs md:text-sm text-muted-foreground">
            Progress: {currentRespondent} / {maxRespondent} responses
          </p>
        </div>
      </CardHeader>
    </Card>
  )
}

/* ---------------------------- Survey CTA --------------------------- */

type SubmitResponsesButtonProps = {
  state: 'idle' | 'encrypting' | 'submitting' | 'submitted'
  buttonText: string
  handleSubmit: () => void
  resetResponses: () => void
}

const SubmitResponsesButton: React.FC<SubmitResponsesButtonProps> = ({
  state,
  buttonText,
  handleSubmit,
  resetResponses,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <Button variant="neutral" onClick={resetResponses} className="w-full md:max-w-xs">
        Reset Answers
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={state === 'encrypting' || state === 'submitting'}
        className="w-full md:max-w-xs"
      >
        {state === 'encrypting' && <Lock className="mr-2 h-4 w-4 animate-spin" />}
        {state === 'submitting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonText}
      </Button>
    </div>
  )
}


type CloseSurveyButtonProps = {
  handleClose: (onSuccess: () => void, onError: () => void) => void
}

const CloseSurveyButton = ({ handleClose }: CloseSurveyButtonProps) => {
  const [state, setState] = useState<'idle' | 'closing' | 'closed'>('idle')
  const disabled = state !== 'idle'

  const handleClick = () => {
    setState('closing')
    handleClose(
      () => setState('closed'),
      () => setState('idle'),
    )
  }

  return (
    <div className="w-full bg-secondary-background">
      <Button className="w-full" size="lg" onClick={handleClick} disabled={disabled}>
        <span>
          {state === 'idle' && 'Close Survey'}
          {state === 'closing' && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Closing Survey...
            </>
          )}
          {state === 'closed' && 'Survey Closed'}
        </span>
      </Button>
    </div>
  )
}

type RevealResponsesButtonProps = {
  handleReveal: () => void
}

const RevealResponsesButton: React.FC<RevealResponsesButtonProps> = ({ handleReveal }) => {
  const [state, setState] = useState<'idle' | 'revealing' | 'revealed'>('idle')
  const disabled = state !== 'idle'

  return (
    <div className="w-full bg-secondary-background">
      <Button
        className="w-full"
        onClick={() => {
          setState('revealing')
          try {
            handleReveal()
            setState('revealed')
          } catch (error) {
            console.error('Error revealing responses:', error)
            setState('idle')
          }
        }}
        disabled={disabled}
      >
        {state === 'idle' && 'Reveal Responses'}
        {state === 'revealing' && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Revealing Responses...
          </>
        )}
      </Button>
    </div>
  )
}
