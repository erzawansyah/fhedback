import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAccount, useReadContracts } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useEffect, useMemo, useState } from 'react'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Share2 } from 'lucide-react'
import type { Address } from 'viem'
import { toast } from 'sonner'
import { hideAddress } from '../utils/hideAddress'
export const Route = createFileRoute('/surveys/explore')({
  component: RouteComponent,
})


const factoryAddress = FACTORY_ADDRESS
const factoryAbi = ABIS.factory

const status = {
  0: { label: 'Draft', tone: 'default' as const },
  1: { label: 'Active', tone: 'success' as const },
  2: { label: 'Closed', tone: 'warning' as const },
  3: { label: 'Trashed', tone: 'muted' as const },
} as const

const useSurveysData = () => {
  const [count, setCount] = useState(0)
  const [surveyIds, setSurveyIds] = useState<Address[]>([])
  const { data } = useReadContracts({
    contracts: [
      {
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'totalSurveys',
      },
      {
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'getAllSurveys',
      }
    ],
  })

  useEffect(() => {
    if (data) {
      const [count, surveys] = data
      if (count.status === "success") {
        setCount(Number(count.result))
        setSurveyIds(surveys.result as Address[])
      }
    }
  }, [data])
  // Placeholder for data fetching logic
  return {
    data: { count, surveyIds }
  }
}

function RouteComponent() {
  const surveys = useSurveysData()

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="px-8 bg-white gap-4">
          <h1>Explore Surveys</h1>
          <p>
            Browse and discover surveys from the community. There are some survey available. You can view active surveys, check their details, and participate in surveys that interest you.
          </p>
        </Card>
        {surveys.data.surveyIds.map((addr, idx) => {
          return (<SurveyItem key={idx} addr={addr} />)
        })}
      </div>
    </main>
  )
}

const SurveyItem = ({ addr }: { addr: Address }) => {
  const account = useAccount()
  const data = useSurveyDataByAddress(addr)

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

  if (!data) return <div className="p-4 text-sm text-gray-500">Loading survey {addr}...</div>
  if (data.config?.status !== 1) return null;
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
          <span className="text-xs text-gray-500">
            {account.address === data.config?.owner ? "<You>" : hideAddress(data.config?.owner)}
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
          <Button
            variant={"reverse"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(data.address || '')
              toast.success('Survey address copied to clipboard')
            }}
          >
            <Share2 className="w-3 h-3" />
          </Button>
          <Link to={`/survey/view/$addr`} params={{ addr: addr }}>
            <Button variant={"reverse"} size="sm" className="h-6 px-2 text-xs">
              Participate
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
