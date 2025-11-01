import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Fuel,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertCircleIcon,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Card } from '../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Input } from '../components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Textarea } from '../components/ui/textarea'
import { Button } from '../components/ui/button'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useEffect, useMemo, useState } from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Badge } from '../components/ui/badge'
import { createDb } from '../services/firebase/dbStore'
import { useAccount } from 'wagmi'
import { useSurveyCreation } from '../hooks/useSurveyCreation'
import { toast } from 'sonner'
import { WalletGuard } from '../components/WalletGuard'

export const Route = createFileRoute('/survey/create')({
  component: RouteComponent,
})

const categories = [
  'Product Feedback',
  'User Experience',
  'Market Research',
  'Academic Research',
  'Psychological Assessment',
  'Other',
] as const

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: "id", name: "Bahasa Indonesia" }
]
const languages_enum = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'id'] as const

const InputSchema = z.object({
  symbol: z.string().min(1, 'Survey symbol is required'),
  title: z.string().min(1, 'Survey title is required'),
  language: z.enum(languages_enum).default('en'),
  description: z.string().optional().default('No description provided'),
  category: z.enum(categories).optional(),
  max_respondents: z.number().int().min(3).max(1000).optional().default(100),
  max_scale: z.number().int().min(2).max(10).optional().default(5),
  min_label: z.string().optional().default('Strongly Disagree'),
  max_label: z.string().optional().default('Strongly Agree'),
  questions: z.array(z.object({
    text: z.string().min(1, 'Question text is required'),
    helper_text: z.string().optional().default('No helper text provided'),
  }))
    .min(1, 'At least one question is required')
    .max(20, 'A maximum of 20 questions are allowed')
    .optional()
    .default([{
      text: 'Sample Question',
      helper_text: '',
    }]),
})

const R = () => <span className="ml-0.5 text-danger">*</span>

function RouteComponent() {
  return (
    <WalletGuard>
      <CreateSurveyPage />
    </WalletGuard>
  )
}

function CreateSurveyPage() {
  const account = useAccount()
  const s = useSurveyCreation()
  const navigate = useNavigate({ from: Route.fullPath })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [step, setStep] = useState<'metadata' | 'questions' | 'review'>('metadata')

  const disabledButton = useMemo(() => {
    return status === 'submitting' || status === 'success'
  }, [status])

  const submitButtonText = useMemo(() => {
    if (status === 'submitting') return 'Submitting...'
    if (status === 'success') return 'Tx Submitted'
    if (status === 'error') return 'Error'
    return 'Create Survey'
  }, [status])

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    resolver: zodResolver(InputSchema),
    defaultValues: {
      description: 'No description provided',
      max_scale: 5,
      min_label: 'Strongly Disagree',
      max_label: 'Strongly Agree',
      questions: [{ text: 'Sample Question', helper_text: 'This is a sample question.' }],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  })

  const qCount = fields.length
  const canAddMore = qCount < 20

  const onSubmit = async (data: z.infer<typeof InputSchema>) => {
    if (step !== 'review') return

    setStatus('submitting')
    const preparedMetadata = {
      title: data.title,
      description: data.description || '',
      language: data.language,
      category: data.category,
      instructions: "", // Placeholder for future use
      targetAudience: [], // Placeholder for future use
      tags: [], // Placeholder for future use
    }

    const preparedQuestions = data.questions.map((q, id) => ({
      id: id,
      text: q.text,
      helper_text: q.helper_text ?? '',
      response: {
        type: 'rating',
        minScore: 1,
        maxScore: data.max_scale ?? 5,
        minLabel: data.min_label ?? 'Strongly Disagree',
        maxLabel: data.max_label ?? 'Strongly Agree',
      },
    }))

    const metadataCID = await createDb(
      preparedMetadata,
      account.address
    )

    const questionsCID = await createDb(
      preparedQuestions,
      account.address
    )

    const preparedSurveyCreation = {
      owner: account.address!,
      symbol: data.symbol,
      metadataCID: metadataCID || '',
      questionsCID: questionsCID || '',
      totalQuestions: preparedQuestions.length,
      respondentLimit: data.max_respondents ?? 100,
    }

    s.createSurvey(preparedSurveyCreation)
  }

  useEffect(() => {
    if (status === "submitting") {
      if (s.hash) {
        setStatus("success")
        toast.success("Survey creation transaction submitted! ", {
          action: {
            label: 'View TX',
            onClick: () => {
              window.open(`https://eth-sepolia.blockscout.com/tx/${s.hash}`, `_blank`)
            }
          }
        })
      }
      if (s.isError) {
        setStatus("error")
        toast.error(`Error creating survey: ${s.error?.message || `Unknown error`}`)
      }
    }
  }, [status, s.hash, s.isError, s.error])

  useEffect(() => {
    if (status === "error") {
      // Reset status to idle after showing error
      const timer = setTimeout(() => {
        setStatus("idle")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  useEffect(() => {
    if (status === "success" && s.isConfirmed && s.receipt) {
      const surveyAddress = s.receipt.logs[0].address
      // Navigate to the survey review page
      setTimeout(() => {
        navigate({
          to: `/surveys/me`,
          search: {
            addr: surveyAddress as string
          }
        })
      }, 1000)
    }
  }, [status, s.hash, s.receipt, s.isConfirmed, navigate])

  const reviewedData = watch();
  const maxScale = watch('max_scale') ?? 5
  const minLabel = watch('min_label') ?? 'Strongly Disagree'
  const maxLabel = watch('max_label') ?? 'Strongly Agree'

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">

        {step !== "review" && (
          <>
            <Card className="px-8 bg-white gap-4">
              <h1>Create New Survey</h1>
              <p>Please fill in your survey details below. All data entered in this form will be securely stored on the blockchain.</p>
            </Card>

            <Alert className="mt-4">
              <Fuel />
              <AlertTitle className="font-heading">Fee Alert</AlertTitle>
              <AlertDescription className="font-light">
                Please be aware that gas fees for creating a survey can sometimes be very high. Review estimated transaction costs before proceeding.
              </AlertDescription>
            </Alert>
          </>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (step !== 'review' && e.key === 'Enter') e.preventDefault()
          }}
          className="space-y-6"
        >
          {step === 'metadata' && (
            <Card className="mt-4 px-8 bg-white gap-4">

              <div className="space-y-1.5">
                <Label htmlFor="symbol">Survey Symbol (Ticker)<R /></Label>
                <p className="text-xs text-subtle italic">Enter a unique symbol for your survey. This will be used to identify your survey on the blockchain and cannot be changed after creation.</p>
                <Input id="symbol" placeholder="SURVEY123" className="mb-4" required {...register("symbol")} />
                {errors.symbol && <p className="text-xs text-danger italic">{errors.symbol.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">Survey Title<R /></Label>
                <p className="text-xs text-subtle italic">Enter the title of your survey.</p>
                <Input id="title" placeholder="Survey Title" className="mb-4" required {...register("title")} />
                {errors.title && <p className="text-xs text-danger italic">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Survey Description</Label>
                <p className="text-xs text-subtle italic">Provide a brief description of your survey.</p>
                <Textarea id="description" placeholder="Survey Description" className="mb-4" {...register("description")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_respondents">Maximum Respondents<R /></Label>
                <p className="text-xs text-subtle italic">Set the maximum number of respondents allowed for this survey (1 to 1,000,000).</p>
                <Input
                  type="number"
                  id="max_respondents"
                  placeholder="1000"
                  className="mb-1"
                  min={1}
                  max={1000000}
                  {...register('max_respondents', { valueAsNumber: true })}
                />
                {errors.max_respondents && <p className="text-xs text-danger italic">{String(errors.max_respondents.message)}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Survey Category</Label>
                <p className="text-xs text-subtle italic">Optionally, specify a category for your survey.</p>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-xs text-danger italic">{String(errors.category.message)}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Survey Languages<R /></Label>
                <p className="text-xs text-subtle italic">Select one or more languages for your survey.</p>
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} defaultValue='en'>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.language && <p className="text-xs text-danger italic">{String(errors.language.message)}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_scale">Maximum Scale Value</Label>
                <p className="text-xs text-subtle italic">Define the maximum value for the survey scale, 2 to 10.</p>
                <Input
                  type="number"
                  id="max_scale"
                  placeholder="5"
                  className="mb-1"
                  min={2}
                  max={10}
                  {...register('max_scale', { valueAsNumber: true })}
                />
                {errors.max_scale && <p className="text-xs text-danger italic">{String(errors.max_scale.message)}</p>}
                <p className="text-[11px] text-subtle">Current preview scale is 1 to {maxScale} with labels "{minLabel}" to "{maxLabel}".</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="min_label">Minimum Scale Label</Label>
                  <p className="text-xs text-subtle italic">Default is Strongly Disagree.</p>
                  <Input id="min_label" placeholder="Strongly Disagree" className="mb-4" {...register("min_label")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max_label">Maximum Scale Label</Label>
                  <p className="text-xs text-subtle italic">Default is Strongly Agree.</p>
                  <Input id="max_label" placeholder="Strongly Agree" className="mb-4" {...register("max_label")} />
                </div>
              </div>
            </Card>
          )}

          {step === 'questions' && (
            <Card className="mt-4 px-8 bg-white gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg">Survey Questions</h2>
                  <p className="text-subtle text-sm">Define up to 20 questions. Each question will use the scale defined in the previous step.</p>
                </div>
                <div className="text-sm text-subtle">Total: {qCount}/20</div>
              </div>

              <div className="space-y-4 mt-4">
                {fields.map((field, index) => (
                  <QuestionCard
                    key={field.id}
                    index={index}
                    questionCount={qCount}
                    register={register}
                    errors={errors}
                    onMoveUp={() => move(index, index - 1)}
                    onMoveDown={() => move(index, index + 1)}
                    onRemove={() => remove(index)}
                    maxScale={maxScale}
                    minLabel={minLabel}
                    maxLabel={maxLabel}
                  />
                ))}
              </div>

              <div className="w-full flex flex-col items-end">
                <Button
                  type="button"
                  onClick={() => append({ text: '', helper_text: '' })}
                  disabled={!canAddMore}
                >
                  <Plus className="h-2 w-2 mr-2" />
                  Add Question
                </Button>
                {!canAddMore && (
                  <p className="text-xs text-danger italic mt-2">
                    A maximum of 20 questions are allowed.
                  </p>
                )}
              </div>
            </Card>
          )}

          {
            step === 'review' && <ReviewCard data={reviewedData} />
          }

          <div className='flex flex-col md:flex-row justify-between gap-4'>
            {step === 'metadata' ? (
              <>
                <Button className='w-full md:min-w-52' asChild variant='neutral' type='button' disabled={disabledButton}>
                  <Link to="/">
                    <ArrowLeft />
                    Back to Home
                  </Link>
                </Button>
                <Button className='w-full md:min-w-52' type='button' onClick={(e) => {
                  e.preventDefault()
                  setStep('questions')
                }} disabled={disabledButton}>
                  Define Questions
                  <ArrowRight />
                </Button>
              </>
            ) : step === 'questions' ? (
              <>
                <Button className='w-full md:min-w-52' type='button' variant='neutral' onClick={(e) => {
                  e.preventDefault()
                  setStep('metadata')
                }} disabled={disabledButton}>
                  Edit Metadata
                </Button>
                <Button className='w-full md:min-w-52' type='button' onClick={(e) => {
                  e.preventDefault()
                  setStep('review')
                }} disabled={disabledButton}>
                  Review & Submit
                </Button>
              </>
            ) : (
              <>
                <Button className='w-full md:min-w-52' type='button' variant='neutral' onClick={(e) => {
                  e.preventDefault()
                  setStep('questions')
                }} disabled={disabledButton}>
                  Edit Questions
                </Button>
                <Button className='w-full md:min-w-52' type='submit' disabled={disabledButton}>
                  {
                    status === "submitting" && <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  }
                  {submitButtonText}
                </Button>
              </>
            )}
          </div>
        </form>
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-danger/10 border border-danger text-danger rounded">
            <p className="font-medium mb-2">Please fix the following errors before submitting:</p>
            <ul className="list-disc list-inside text-sm">
              <pre>
                {JSON.stringify(errors, null, 2)}
              </pre>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  {key}: {String((value).message)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}

function QuestionCard({
  index,
  questionCount,
  register,
  errors,
  onMoveUp,
  onMoveDown,
  onRemove,
  maxScale,
  minLabel,
  maxLabel,
}: {
  index: number
  questionCount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  maxScale: number
  minLabel: string
  maxLabel: string
}) {
  return (
    <div className='flex items-start'>
      <div className='flex flex-col gap-2'>
        <Button
          type="button"
          size={"icon"}
          variant={'noShadow'}
          className='mr-4 bg-muted/59'
        >
          {index + 1}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="neutral"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Move up"
        >
          <ArrowUp className="h-2 w-2" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="neutral"
          onClick={onMoveDown}
          disabled={index === questionCount - 1}
          aria-label="Move down"
        >
          <ArrowDown className="h-2 w-2" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={onRemove}
          aria-label="Remove question"
        >
          <Trash2 className="h-2 w-2" />
        </Button>
      </div>

      <div className="p-4 flex-1 bg-background border-subtle">
        <div className="space-y-1.5">
          <Label htmlFor={`questions.${index}.text`}>Question Text<R /></Label>
          <Input
            id={`questions.${index}.text`}
            placeholder="Type your question..."
            {...register(`questions.${index}.text` as const)}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(errors.questions as any)?.[index]?.text && (
            <p className="text-xs text-danger italic">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(errors.questions as any)?.[index]?.text?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 mt-3">
          <Label htmlFor={`questions.${index}.helper_text`}>Helper Text</Label>
          <Textarea
            id={`questions.${index}.helper_text`}
            placeholder="Optional guidance for respondents"
            {...register(`questions.${index}.helper_text` as const)}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(errors.questions as any)?.[index]?.helper_text && (
            <p className="text-xs text-danger italic">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {String((errors.questions as any)?.[index]?.helper_text?.message)}
            </p>
          )}
        </div>

        <p className="text-[11px] text-subtle mt-3">
          Response scale preview: 1 to {maxScale} ({minLabel} to {maxLabel})
        </p>
      </div>
    </div>
  )
}


function ReviewCard({ data }: {
  data: {
    symbol?: string
    title?: string
    description?: string
    category?: typeof categories[number]
    max_scale?: number
    min_label?: string
    max_label?: string
    questions?: Array<{
      text: string
      helper_text?: string
    }>
  }
}) {
  return (
    <>
      <Card className="mt-4 px-4 md:px-8 bg-white gap-2">
        <div className='flex flex-col md:flex-row items-start justify-between gap-2'>
          <h3 className="text-xl md:text-2xl">{data.title}</h3>
          {data.category && <Badge className="self-start">{data.category}</Badge>}
        </div>
        {data.description && <p className="text-subtle text-sm">{data.description}</p>}
      </Card>

      <Alert className="mt-4">
        <AlertCircleIcon />
        <AlertTitle className="font-heading">Preview Mode [{data.symbol}]</AlertTitle>
        <AlertDescription className="font-light">
          This is preview mode — data has not been submitted to the blockchain. Please review all details before creating your survey.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 mt-4">
        {data.questions && data.questions.map((q, idx) => (
          <Card key={idx} className="flex px-4 md:px-8 bg-white">
            {/* Question Number */}
            <div className="flex-1">
              <h4 className="font-medium text-base md:text-xl">{q.text}</h4>
              {q.helper_text && <p className="text-subtle text-xs italic mt-1">{q.helper_text}</p>}
              <div className="flex mt-2">
                <div className="flex flex-col md:flex-row items-center justify-around w-full gap-2">
                  <div className="text-xs md:text-sm self-start md:self-center">{data.min_label ?? "Strongly Disagree"}</div>
                  <div className="flex flex-1 justify-center gap-1 md:gap-[2%] flex-wrap">
                    {Array.from({ length: data.max_scale ?? 5 }, (_, i) => (
                      <Button
                        key={i}
                        size={"icon"}
                        variant={"reverse"}
                        className="w-10 h-10 md:w-12 md:h-12"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs md:text-sm self-end md:self-center">{data.max_label ?? "Strongly Agree"}</div>
                </div>
              </div>

            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
