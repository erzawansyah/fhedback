import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useEffect, useMemo, useState } from 'react'
import { useSurveyDataById } from '../hooks/useSurveyData'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2Icon, Share2, Trash } from 'lucide-react'
import type { Address } from 'viem'
import { toast } from 'sonner'
import { WalletGuard } from '../components/WalletGuard'

export const Route = createFileRoute('/surveys/me')({
  component: RouteComponent,
})

const factoryAddress = FACTORY_ADDRESS
const factoryAbi = ABIS.factory
const surveyAbi = ABIS.survey

const status = {
  0: { label: 'Draft', tone: 'default' as const },
  1: { label: 'Active', tone: 'success' as const },
  2: { label: 'Closed', tone: 'warning' as const },
  3: { label: 'Trashed', tone: 'muted' as const },
} as const

const useMySurveysData = () => {
  const [count, setCount] = useState(0)
  const [surveyIds, setSurveyIds] = useState<number[]>([])

  const account = useAccount()
  const { data } = useReadContracts({
    contracts: [
      {
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'getSurveyCountByOwner',
        args: [account.address],
      },
      {
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'getSurveysByOwner',
        args: [account.address],
      }
    ],
  })

  useEffect(() => {
    if (data) {
      const [count, surveys] = data
      if (count.status === "success") {
        setCount(Number(count.result))
        setSurveyIds(surveys.result as number[])
      }
    }
  }, [data])
  // Placeholder for data fetching logic
  return {
    data: { count, surveyIds }
  }
}

function RouteComponent() {
  return (
    <WalletGuard>
      <MySurveysPage />
    </WalletGuard>
  )
}

function MySurveysPage() {
  const surveys = useMySurveysData()

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="px-8 bg-white gap-4">
          <h1>My Surveys</h1>
          <p>
            Manage your surveys here. You have created <strong>{surveys.data.count}</strong> survey{surveys.data.count !== 1 ? 's' : ''}. In this page , you can view the status of each survey, edit their metadata and questions, publish them, and access detailed statistics once they are active.
          </p>
        </Card>
        {surveys.data.surveyIds.map((id) => {
          return (<SurveyItem key={id} id={id} />)
        })}
      </div>
    </main>
  )
}

const SurveyItem = ({ id }: { id: number }) => {
  const account = useAccount()
  const data = useSurveyDataById(id)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusInfo = useMemo(() => {
    if (!data || data.config?.status === undefined) return { label: 'Unknown', tone: 'muted' as const }
    return status[data.config.status as keyof typeof status] || { label: 'Unknown', tone: 'muted' as const }
  }, [data])

  const maxScores: number[] = useMemo(() => {
    if (!data || !data.questions) return []
    return data.questions.map((q) => {
      return q.response.maxScore
    })
  }, [data])

  if (!data) return <div className="p-4 text-sm text-gray-500">Loading survey {id}...</div>

  return (
    <Card className="px-6 bg-white  gap-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate mb-1">
            <span className='mr-2 font-extrabold'>[{data.config?.symbol}]</span>
            {data.metadata?.title}</h3>
          <p className="text-xs text-subtle truncate">
            {data.metadata?.description || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {data.metadata?.category && (
            <Badge variant="neutral" className="h-5 px-2 text-xs">{data.metadata.category}</Badge>
          )}
          <Badge variant="neutral" className="h-5 px-2 text-xs">
            {data.metadata?.language.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-800">{data.config?.symbol}</span>
          <span>{data.config?.totalQuestions} Questions</span>
          <span>Limit: {data.config?.respondentLimit}</span>
        </div>
        {data.config?.createdAt && (
          <span>{formatDate(data.config.createdAt.toISOString())}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={statusInfo.tone === 'success' ? 'default' : 'neutral'}
            className="h-5 px-2 text-xs"
          >
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-gray-500 truncate max-w-[150px]">
            {account.address === data.config?.owner ? "<You>" : data.config?.owner}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="hidden sm:inline text-xs text-gray-400 cursor-pointer hover:text-gray-600 truncate max-w-[150px]"
            onClick={() => {
              navigator.clipboard.writeText(data.address || '')
              toast.success('Address copied to clipboard')
            }}
            title="Click to copy"
          >
            {data.address}
          </span>
          <SurveyAction status={data.config ? data.config.status : 0} surveyAddress={data.address!} maxScores={maxScores} />
        </div>
      </div>
    </Card>
  )
}

const SurveyAction = ({ status, surveyAddress, maxScores }: { status: number, surveyAddress: Address, maxScores: number[] }) => {
  switch (status) {
    case 0: // Draft
      return (
        <>
          {/* Can edit metadata, question, and publish */}
          <DeleteButton surveyAddress={surveyAddress} />
          <Button variant={"reverse"} size="sm" className="h-6 px-2 text-xs bg-white">Edit Metadata</Button>
          <Button variant={"reverse"} size="sm" className="h-6 px-2 text-xs bg-white">Edit Questions</Button>
          <PublishButton surveyAddress={surveyAddress} maxScores={maxScores} />
        </>
      )
    case 1: // Active
      return <>
        <Button variant={"reverse"} size="sm" asChild className="h-6 px-2 text-xs bg-background">
          <Link to={`/survey/stats/$addr`} params={{ addr: surveyAddress }}>Stats</Link>
        </Button>
        <Button variant={"reverse"} size="sm" asChild className="h-6 px-2 text-xs bg-background">
          <Link to={`/survey/view/$addr`} params={{ addr: surveyAddress }}>View</Link>
        </Button>
        {/* Share with icon */}
        <Button variant={"reverse"} size="icon" className="h-6 px-2 text-xs"><Share2 className="h-2 w-2" /></Button>
      </>
    case 2: // Closed
      return <>
        <Button variant={"reverse"} size="sm" asChild className="h-6 px-2 text-xs bg-background">
          <Link to={`/survey/stats/$addr`} params={{ addr: surveyAddress }}>Stats</Link>
        </Button>
        <Button variant={"reverse"} size="sm" disabled className="h-6 px-2 text-xs">
          View
        </Button>
      </>
    case 3: // Trashed
      return <Button variant={"reverse"} size="sm" className="h-6 px-2 text-xs" disabled>No Action Allowed</Button>
  }
}


const DeleteButton = ({ surveyAddress }: { surveyAddress: Address }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const disabled = state === 'loading'
  const { writeContractAsync: write, data: hash } = useWriteContract()

  const handleDelete = async (surveyAddress: Address) => {
    setState('loading')
    await write({
      abi: surveyAbi,
      address: surveyAddress,
      functionName: 'deleteSurvey',
    })
  }

  useEffect(() => {
    if (hash) {
      setState('success')
      toast.success('Survey deleted successfully', {
        action: {
          label: "View Transaction",
          onClick: () => {
            window.open(`https://eth-sepolia.blockscout.com/tx/${hash}`, `_blank`)
          }
        }
      })
      setTimeout(() => {
        setState('idle')
      }, 3000);
    }
  }, [hash])

  return (
    <Button
      variant={"reverse"}
      size="icon"
      className="h-6 text-xs bg-danger"
      disabled={disabled}
      onClick={() => handleDelete(surveyAddress)} >
      {
        state === 'loading' ? '...' : <Trash className='h-4' />
      }
    </Button>
  )
}


const PublishButton = ({ surveyAddress, maxScores }: { surveyAddress: Address, maxScores: number[] }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const disabled = state === 'loading'
  const { writeContractAsync: write, data: hash } = useWriteContract()

  const handlePublish = async (surveyAddress: Address) => {
    setState('loading')
    await write({
      abi: surveyAbi,
      address: surveyAddress,
      functionName: 'publishSurvey',
      args: [maxScores]
    })
  }

  useEffect(() => {
    if (hash) {
      setState('success')
      toast.success('Survey deleted successfully', {
        action: {
          label: "View Transaction",
          onClick: () => {
            window.open(`https://eth-sepolia.blockscout.com/tx/${hash}`, `_blank`)
          }
        }
      })
      setTimeout(() => {
        setState('idle')
      }, 3000);
    }
  }, [hash])

  return (
    <Button
      variant={"reverse"}
      size="sm"
      className="h-6 text-xs"
      disabled={disabled}
      onClick={() => handlePublish(surveyAddress)} >
      {
        state === 'loading' && <Loader2Icon className='h-4 w-4 mr-2 animate-spin' />
      }
      {
        state === 'loading' ? 'Publishing...' : 'Publish'
      }
    </Button>
  )
}   
