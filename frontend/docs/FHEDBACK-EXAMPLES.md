# 🎯 FHEdback Code Examples

This document provides practical examples of common patterns and implementations used in the FHEdback project.

## 🔧 Smart Contract Integration Examples

### Creating a Survey

```typescript
import { useSurveyCreation } from '@/hooks/useSurveyCreation'
import { useAccount } from 'wagmi'
import { useState } from 'react'

export function CreateSurveyExample() {
  const { address } = useAccount()
  const { createSurvey, isPending, isConfirmed, hash } = useSurveyCreation()
  const [formData, setFormData] = useState({
    symbol: '',
    title: '',
    questions: ['']
  })

  const handleSubmit = async () => {
    try {
      // 1. Upload metadata to IPFS
      const metadataCID = await uploadToIPFS({
        title: formData.title,
        description: "Survey description",
        category: "product_feedback"
      })

      // 2. Upload questions to IPFS
      const questionsCID = await uploadToIPFS({
        name: formData.title,
        totalQuestions: formData.questions.length,
        questions: formData.questions.map((q, i) => ({
          id: i,
          text: q,
          type: "rating",
          required: true,
          options: { min: 1, max: 5 }
        }))
      })

      // 3. Create survey contract
      createSurvey({
        owner: address!,
        symbol: formData.symbol,
        metadataCID,
        questionsCID,
        totalQuestions: formData.questions.length,
        respondentLimit: 100
      })
    } catch (error) {
      console.error('Failed to create survey:', error)
    }
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="Survey symbol (e.g., SURV)"
        value={formData.symbol}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          symbol: e.target.value.toUpperCase() 
        }))}
      />
      
      <input
        placeholder="Survey title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          title: e.target.value 
        }))}
      />

      <button 
        onClick={handleSubmit}
        disabled={isPending || !address}
      >
        {isPending ? 'Creating...' : 'Create Survey'}
      </button>

      {hash && (
        <div>
          Transaction: {hash}
          {isConfirmed && <span> ✅ Confirmed</span>}
        </div>
      )}
    </div>
  )
}
```

### Reading Survey Data

```typescript
import { useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'
import { useSurveyDataByAddress } from '@/hooks/useSurveyData'

export function SurveyListExample({ userAddress }: { userAddress: `0x${string}` }) {
  // Get all surveys created by user
  const { data: surveyAddresses } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: ABIS.factory,
    functionName: 'getSurveysByOwner',
    args: [userAddress]
  })

  return (
    <div className="space-y-4">
      <h2>Your Surveys</h2>
      {surveyAddresses?.map((address) => (
        <SurveyCard key={address} address={address} />
      ))}
    </div>
  )
}

function SurveyCard({ address }: { address: `0x${string}` }) {
  const { surveyData, metadata, isLoading } = useSurveyDataByAddress(address)

  if (isLoading) return <div>Loading...</div>

  const status = surveyData ? Number(surveyData[7]) : 0
  const statusLabels = ['Created', 'Active', 'Closed', 'Trashed']

  return (
    <div className="border rounded-lg p-4">
      <h3>{metadata?.title || 'Untitled Survey'}</h3>
      <p>Status: {statusLabels[status]}</p>
      <p>Symbol: {surveyData?.[1]}</p>
      <p>Created: {surveyData?.[5] ? 
        new Date(Number(surveyData[5]) * 1000).toLocaleDateString() : 
        'Unknown'
      }</p>
    </div>
  )
}
```

### Publishing a Survey

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ABIS } from '@/services/contracts'

export function PublishSurveyExample({ 
  surveyAddress, 
  questionCount 
}: { 
  surveyAddress: `0x${string}`
  questionCount: number 
}) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  })

  const publishSurvey = () => {
    // Set maximum scores for each question (1-10 range)
    const maxScores = Array(questionCount).fill(5) // All questions max score = 5

    writeContract({
      address: surveyAddress,
      abi: ABIS.survey,
      functionName: 'publishSurvey',
      args: [maxScores]
    })
  }

  return (
    <button 
      onClick={publishSurvey}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Publishing...' : 
       isConfirming ? 'Confirming...' : 
       isSuccess ? 'Published!' : 
       'Publish Survey'}
    </button>
  )
}
```

## 🎨 UI Component Examples

### Form with Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  questions: z.array(z.string().min(1, 'Question cannot be empty')).min(1, 'At least one question required')
})

type FormData = z.infer<typeof schema>

export function SurveyFormExample() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      questions: ['']
    }
  })

  const questions = watch('questions')

  const addQuestion = () => {
    setValue('questions', [...questions, ''])
  }

  const removeQuestion = (index: number) => {
    setValue('questions', questions.filter((_, i) => i !== index))
  }

  const onSubmit = (data: FormData) => {
    console.log('Survey data:', data)
    // Handle form submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label>Survey Title</label>
        <input
          {...register('title')}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Enter survey title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label>Description</label>
        <textarea
          {...register('description')}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Describe your survey"
          rows={3}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label>Questions</label>
          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add Question
          </button>
        </div>
        
        {questions.map((_, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              {...register(`questions.${index}`)}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder={`Question ${index + 1}`}
            />
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {errors.questions && (
          <p className="text-red-500 text-sm">{errors.questions.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded-lg"
      >
        Create Survey
      </button>
    </form>
  )
}
```

### Data Loading with Error Handling

```typescript
import { useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, ABIS } from '@/services/contracts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function SurveyStatsExample() {
  const { 
    data: totalSurveys, 
    isLoading, 
    isError, 
    error 
  } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: ABIS.factory,
    functionName: 'totalSurveys'
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load survey statistics: {error?.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-4">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Surveys"
          value={totalSurveys ? Number(totalSurveys).toLocaleString() : '0'}
          icon="📊"
        />
        <StatCard
          title="Active Surveys"
          value="--"
          icon="🟢"
        />
        <StatCard
          title="Total Responses"
          value="--"
          icon="📝"
        />
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string
  value: string
  icon: string 
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

## 🔧 Custom Hook Examples

### Survey Management Hook

```typescript
import { useState, useCallback } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { ABIS } from '@/services/contracts'

export function useSurveyManagement(surveyAddress: `0x${string}`) {
  const [isOperationPending, setIsOperationPending] = useState(false)

  // Read survey data
  const { data: surveyData, refetch } = useReadContract({
    address: surveyAddress,
    abi: ABIS.survey,
    functionName: 'survey'
  })

  // Write operations
  const { writeContract } = useWriteContract()

  const publishSurvey = useCallback(async (maxScores: number[]) => {
    setIsOperationPending(true)
    try {
      writeContract({
        address: surveyAddress,
        abi: ABIS.survey,
        functionName: 'publishSurvey',
        args: [maxScores]
      })
      await refetch()
    } finally {
      setIsOperationPending(false)
    }
  }, [surveyAddress, writeContract, refetch])

  const closeSurvey = useCallback(async () => {
    setIsOperationPending(true)
    try {
      writeContract({
        address: surveyAddress,
        abi: ABIS.survey,
        functionName: 'closeSurvey'
      })
      await refetch()
    } finally {
      setIsOperationPending(false)
    }
  }, [surveyAddress, writeContract, refetch])

  const deleteSurvey = useCallback(async () => {
    setIsOperationPending(true)
    try {
      writeContract({
        address: surveyAddress,
        abi: ABIS.survey,
        functionName: 'deleteSurvey'
      })
      await refetch()
    } finally {
      setIsOperationPending(false)
    }
  }, [surveyAddress, writeContract, refetch])

  return {
    surveyData,
    isOperationPending,
    actions: {
      publishSurvey,
      closeSurvey,
      deleteSurvey
    },
    refresh: refetch
  }
}
```

### IPFS Upload Hook

```typescript
import { useState, useCallback } from 'react'

interface UploadResult {
  cid: string
  url: string
}

export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const upload = useCallback(async (data: any, type: 'metadata' | 'questions'): Promise<UploadResult> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, type })
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        cid: result.cid,
        url: `${import.meta.env.VITE_PINATA_GATEWAY_URL}/ipfs/${result.cid}`
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(message)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    upload,
    isUploading,
    uploadError
  }
}
```

## 🎯 Utility Function Examples

### Address Formatting

```typescript
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
```

### Date Formatting

```typescript
export function formatTimestamp(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getRelativeTime(timestamp: bigint | number): string {
  const now = Date.now()
  const date = Number(timestamp) * 1000
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
```

### Survey Status Helpers

```typescript
export const SURVEY_STATUS = {
  CREATED: 0,
  ACTIVE: 1, 
  CLOSED: 2,
  TRASHED: 3
} as const

export type SurveyStatus = typeof SURVEY_STATUS[keyof typeof SURVEY_STATUS]

export function getSurveyStatusLabel(status: SurveyStatus): string {
  const labels: Record<SurveyStatus, string> = {
    [SURVEY_STATUS.CREATED]: 'Draft',
    [SURVEY_STATUS.ACTIVE]: 'Active',
    [SURVEY_STATUS.CLOSED]: 'Completed',
    [SURVEY_STATUS.TRASHED]: 'Deleted'
  }
  return labels[status] || 'Unknown'
}

export function getSurveyStatusColor(status: SurveyStatus): string {
  const colors: Record<SurveyStatus, string> = {
    [SURVEY_STATUS.CREATED]: 'bg-yellow-100 text-yellow-800',
    [SURVEY_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
    [SURVEY_STATUS.CLOSED]: 'bg-blue-100 text-blue-800',
    [SURVEY_STATUS.TRASHED]: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function canModifySurvey(status: SurveyStatus): boolean {
  return status === SURVEY_STATUS.CREATED
}

export function canPublishSurvey(status: SurveyStatus): boolean {
  return status === SURVEY_STATUS.CREATED
}

export function canCloseSurvey(status: SurveyStatus): boolean {
  return status === SURVEY_STATUS.ACTIVE
}
```

## 🚀 Error Handling Examples

### Contract Error Handling

```typescript
import { useWriteContract } from 'wagmi'
import { parseAbi } from 'viem'

export function useContractOperation() {
  const { writeContract, error } = useWriteContract()

  const handleContractCall = async () => {
    try {
      writeContract({
        address: '0x...',
        abi: parseAbi(['function someFunction(uint256 value)']),
        functionName: 'someFunction',
        args: [123n]
      })
    } catch (error) {
      // Handle different types of errors
      if (error?.message?.includes('User rejected')) {
        console.log('Transaction was rejected by user')
      } else if (error?.message?.includes('insufficient funds')) {
        console.log('Insufficient funds for transaction')
      } else {
        console.log('Transaction failed:', error?.message)
      }
    }
  }

  return { handleContractCall, error }
}
```

### API Error Handling

```typescript
export async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error - check your connection')
    }
    throw error
  }
}
```

---

These examples provide practical patterns for common FHEdback development scenarios. Use them as starting points and adapt them to your specific needs.
