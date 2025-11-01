import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useEffect, useMemo, useState } from 'react'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import type { Address } from 'viem'
import { toast } from 'sonner'
import { hideAddress } from '../utils/hideAddress'
import { WalletGuard } from '../components/WalletGuard'

export const Route = createFileRoute('/surveys/explore')({
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
  return (
    <WalletGuard>
      <ExploreSurveysPage />
    </WalletGuard>
  )
}

function ExploreSurveysPage() {
  const surveys = useSurveysData()

  const sortedAndFiltered = useMemo(() => {
    const hiddenSurveys: Address[] = [
      "0x7610EC3dD79C69AA7C41ac5D742492A0F17e779d",
    ]
    const reversed = [...surveys.data.surveyIds].reverse()
    return reversed.filter(addr => !hiddenSurveys.includes(addr))
  }, [surveys.data.surveyIds])


  return (
    <main className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="px-8 bg-white gap-4">
          <h1>Explore Surveys</h1>
          <p>
            Browse and discover surveys from the community. There are some survey available. You can view active surveys, check their details, and participate in surveys that interest you.
          </p>
        </Card>
        {sortedAndFiltered.map((addr, idx) => {
          return (<SurveyItem key={idx} addr={addr} />)
        })}
      </div>
    </main>
  )
}

const SurveyItem = ({ addr }: { addr: Address }) => {
  const account = useAccount()
  const data = useSurveyDataByAddress(addr)
  const { data: raw } = useReadContract({
    address: addr,
    abi: surveyAbi,
    functionName: 'getHasResponded',
    args: [account.address || '0x0000000000000000000000000000000000000000' as Address],
    query: {
      enabled: !!account.address, // Only fetch if user is connected
    }
  })
  const hasResponded = useMemo(() => {
    if (!account.address) return false // If not connected, assume not responded
    return raw as boolean
  }, [raw, account.address])

  const isClosed = useMemo(() => {
    if (!data || data.config?.status === undefined) return false
    return data.config.status === 2
  }, [data])

  const ownedByUser = useMemo(() => {
    if (!data || !account.address) return false
    return data.config?.owner.toLowerCase() === account.address.toLowerCase()
  }, [data, account.address])

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
  if (data.config?.status !== 1 && data.config?.status !== 2) return null;
  return (
    <Card className={`px-6 gap-1 ${hasResponded ? 'bg-gray-50 border-gray-200' : 'bg-white'}`}>
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
          {hasResponded && (
            <Badge variant="neutral" className="h-5 px-2 text-xs bg-green-100 text-green-700">
              Responded
            </Badge>
          )}
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
          <ActionButton
            address={addr}
            hasResponded={hasResponded}
            owned={ownedByUser}
            isClosed={isClosed}
          />
        </div>
      </div>
    </Card>
  )
}

type ActionButtonProps = {
  address?: Address;
  hasResponded: boolean;
  owned: boolean;
  isClosed: boolean;
}
const ActionButton: React.FC<ActionButtonProps> = ({ address, hasResponded, owned, isClosed }) => {
  // Styled button (Add classes )
  const ViewButton = ({ text }: { text: string }) => (
    <Button asChild variant="reverse" size="sm" className='h-6 px-2 text-xs'>
      <Link to="/survey/view/$addr" params={{ addr: address as string }}>{text}</Link>
    </Button>
  )


  const condition = useMemo(() => {
    if (owned && isClosed) {
      return 'OWNED_CLOSED' // View Results
    }
    if (owned && !isClosed) {
      return 'OWNED_OPEN' // View Progress
    }
    if (hasResponded && isClosed) {
      return 'RESPONDED_CLOSED'
    }
    if (hasResponded && !isClosed) {
      return 'RESPONDED_OPEN'
    }
    if (!hasResponded && !isClosed) {
      return 'NOT_RESPONDED_OPEN'
    }
    return 'DEFAULT'
  }, [owned, hasResponded, isClosed])

  switch (condition) {
    case 'OWNED_CLOSED':
      return <ViewButton text="View Result" />
    case 'OWNED_OPEN':
      return <ViewButton text="View Survey" />
    case 'RESPONDED_CLOSED':
      return <ViewButton text="View Result" />
    case 'RESPONDED_OPEN':
      return <ViewButton text="View My Response" />
    case 'NOT_RESPONDED_OPEN':
      return <ViewButton text="Take Survey" />
    default:
      return <Button variant="reverse" size="sm" disabled className="h-6 px-2 text-xs">Unavailable</Button>
  }
}
