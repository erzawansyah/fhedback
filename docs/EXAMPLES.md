# Development Examples

## 📋 Complete Examples

### Example 1: Creating Survey Results Page

Let's create a complete survey results page with dynamic routing, data fetching, and charts.

#### Step 1: Create the Route
```tsx
// src/routes/surveys.$surveyId.results.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSurveyResults } from '@/services/api/surveys'
import { SurveyResultsView } from '@/components/survey-view/SurveyResultsView'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorMessage } from '@/components/ui/error-message'

export const Route = createFileRoute('/surveys/$surveyId/results')({
  component: SurveyResults,
  beforeLoad: ({ context, params }) => {
    // Check if user owns this survey or has access
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})

function SurveyResults() {
  const { surveyId } = Route.useParams()
  
  const { 
    data: results, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['survey-results', surveyId],
    queryFn: () => getSurveyResults(surveyId),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return <LoadingSpinner message="Loading survey results..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Failed to load results"
        message={error.message}
        retry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="container mx-auto py-8">
      <SurveyResultsView 
        surveyId={surveyId}
        results={results} 
      />
    </div>
  )
}
```

#### Step 2: Create the Component
```tsx
// src/components/survey-view/SurveyResultsView.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, Share2, Eye } from 'lucide-react'
import type { SurveyResults } from '@/types/survey'

interface SurveyResultsViewProps {
  surveyId: string
  results: SurveyResults
}

export function SurveyResultsView({ surveyId, results }: SurveyResultsViewProps) {
  const handleExport = async () => {
    // Export results to CSV/PDF
    const csvData = generateCSV(results)
    downloadFile(csvData, `survey-${surveyId}-results.csv`)
  }

  const handleShare = async () => {
    // Generate shareable link
    await navigator.clipboard.writeText(
      `${window.location.origin}/surveys/${surveyId}/public-results`
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{results.survey.title}</h1>
          <p className="text-gray-600 mt-2">
            {results.totalResponses} responses collected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{results.totalResponses}</div>
            <p className="text-gray-600">Total Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{results.completionRate}%</div>
            <p className="text-gray-600">Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{results.averageTime}m</div>
            <p className="text-gray-600">Avg. Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              <Badge variant={results.status === 'active' ? 'default' : 'secondary'}>
                {results.status}
              </Badge>
            </div>
            <p className="text-gray-600">Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Question Results */}
      <div className="space-y-6">
        {results.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Q{index + 1}: {question.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === 'multiple-choice' && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={question.responses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="option" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#fbbf24" stroke="#000" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {question.type === 'text' && (
                <div className="space-y-2">
                  {question.responses.slice(0, 5).map((response, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border-2 border-gray-200">
                      "{response.text}"
                    </div>
                  ))}
                  {question.responses.length > 5 && (
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View all {question.responses.length} responses
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### Step 3: Create Types
```tsx
// src/types/survey.ts (add to existing)
export interface SurveyResults {
  survey: {
    id: string
    title: string
    description: string
  }
  totalResponses: number
  completionRate: number
  averageTime: number
  status: 'active' | 'closed' | 'draft'
  questions: {
    id: string
    title: string
    type: 'text' | 'multiple-choice' | 'rating'
    responses: Array<{
      option?: string
      text?: string
      rating?: number
      count: number
    }>
  }[]
}
```

#### Step 4: Create API Service
```tsx
// src/services/api/surveys.ts (add to existing)
export async function getSurveyResults(surveyId: string): Promise<SurveyResults> {
  const response = await fetch(`/api/surveys/${surveyId}/results`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch survey results')
  }
  
  return response.json()
}
```

### Example 2: Creating Protected Survey Creation Flow

#### Step 1: Create Multi-Step Form Route
```tsx
// src/routes/_authenticated.surveys.create.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SurveyCreationWizard } from '@/components/survey-creation/SurveyCreationWizard'

export const Route = createFileRoute('/_authenticated/surveys/create')({
  component: CreateSurvey,
})

function CreateSurvey() {
  const [currentStep, setCurrentStep] = useState(1)
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Survey</h1>
        <p className="text-gray-600 mt-2">
          Step {currentStep} of 4 - Build your survey with privacy in mind
        </p>
      </div>
      
      <SurveyCreationWizard 
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
    </div>
  )
}
```

#### Step 2: Multi-Step Form Component
```tsx
// src/components/survey-creation/SurveyCreationWizard.tsx
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createSurveySchema, type CreateSurveyData } from '@/types/survey'
import { createSurvey } from '@/services/api/surveys'
import { StepIndicator } from './StepIndicator'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { QuestionsStep } from './steps/QuestionsStep'
import { PrivacyStep } from './steps/PrivacyStep'
import { ReviewStep } from './steps/ReviewStep'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

interface SurveyCreationWizardProps {
  currentStep: number
  onStepChange: (step: number) => void
}

export function SurveyCreationWizard({ 
  currentStep, 
  onStepChange 
}: SurveyCreationWizardProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const methods = useForm<CreateSurveyData>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [],
      isPrivate: true,
      encryptionLevel: 'high',
      allowAnonymous: true,
    },
    mode: 'onChange',
  })

  const createSurveyMutation = useMutation({
    mutationFn: createSurvey,
    onSuccess: (data) => {
      navigate({ 
        to: '/surveys/$surveyId', 
        params: { surveyId: data.id } 
      })
    },
  })

  const steps = [
    { number: 1, title: 'Basic Info', component: BasicInfoStep },
    { number: 2, title: 'Questions', component: QuestionsStep },
    { number: 3, title: 'Privacy', component: PrivacyStep },
    { number: 4, title: 'Review', component: ReviewStep },
  ]

  const currentStepData = steps[currentStep - 1]
  const StepComponent = currentStepData.component

  const handleNext = async () => {
    const isValid = await methods.trigger()
    if (isValid) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    onStepChange(currentStep - 1)
  }

  const handleSubmit = async (data: CreateSurveyData) => {
    setIsSubmitting(true)
    try {
      await createSurveyMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to create survey:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
        />
        
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <div className="min-h-[400px]">
            <StepComponent />
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Survey'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
```

### Example 3: Real-time Survey Dashboard

#### Create Dashboard Route with Live Updates
```tsx
// src/routes/_authenticated.dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getDashboardStats } from '@/services/api/dashboard'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { RecentSurveys } from '@/components/dashboard/RecentSurveys'
import { QuickActions } from '@/components/dashboard/QuickActions'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(process.env.VITE_WS_URL!)
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'SURVEY_RESPONSE') {
        refetch() // Refresh dashboard data
      }
    }

    return () => ws.close()
  }, [refetch])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <QuickActions />
      </div>
      
      <DashboardOverview stats={stats} />
      <RecentSurveys />
    </div>
  )
}
```

## 🔄 Common Development Patterns

### 1. Data Fetching with Loading States
```tsx
// Hook pattern for consistent loading states
function useSurveyData(surveyId: string) {
  return useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => fetchSurvey(surveyId),
    retry: (failureCount, error) => {
      // Retry logic based on error type
      return failureCount < 3 && error.status !== 404
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Usage in component
function SurveyPage() {
  const { surveyId } = useParams()
  const { data: survey, isLoading, error, refetch } = useSurveyData(surveyId)
  
  if (isLoading) return <SurveyLoadingSkeleton />
  if (error) return <ErrorMessage onRetry={refetch} />
  
  return <SurveyView survey={survey} />
}
```

### 2. Form Validation Patterns
```tsx
// Custom validation hook
function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const validateStep = async (fields?: (keyof T)[]) => {
    if (fields) {
      return await methods.trigger(fields)
    }
    return await methods.trigger()
  }

  return { ...methods, validateStep }
}

// Reusable field component
function FormField({ 
  name, 
  label, 
  type = 'text',
  required = false,
  ...props 
}) {
  const { register, formState: { errors } } = useFormContext()
  
  return (
    <div className="space-y-2">
      <label className="font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        {...register(name)}
        type={type}
        {...props}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm">{errors[name]?.message}</p>
      )}
    </div>
  )
}
```

### 3. Responsive Component Patterns
```tsx
// Mobile-first responsive component
function SurveyCard({ survey }: { survey: Survey }) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold truncate">
              {survey.title}
            </h3>
            <p className="text-gray-600 text-sm md:text-base line-clamp-2">
              {survey.description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Badge variant="outline" className="text-xs">
              {survey.responseCount} responses
            </Badge>
            <Button size="sm" className="w-full sm:w-auto">
              View Results
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4. Error Handling Patterns
```tsx
// Global error boundary
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
        // Send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={resetErrorBoundary}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. Authentication Patterns
```tsx
// Auth context pattern
const AuthContext = createContext<{
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
}>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
```

## 🎯 Development Tips

### Performance Optimization
- Use `React.memo()` for expensive components
- Implement virtual scrolling for large lists
- Use `useMemo()` and `useCallback()` judiciously
- Lazy load routes and components

### Type Safety
- Define strict TypeScript interfaces
- Use branded types for IDs
- Implement proper error types
- Use type guards for runtime validation

### Testing Strategy
- Unit tests for utility functions
- Integration tests for user flows
- Visual regression tests for UI components
- E2E tests for critical paths

### Code Organization
- Group by feature, not by type
- Use barrel exports consistently
- Keep components under 200 lines
- Extract custom hooks for complex logic
