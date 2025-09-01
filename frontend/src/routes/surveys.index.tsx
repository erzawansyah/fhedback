import { createFileRoute } from '@tanstack/react-router'
import { useReadContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { MessageCircle, Users, Search } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useMemo, useState } from 'react'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/surveys/')({
    component: SurveysListPage,
})

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: "Created", color: "bg-yellow-100 text-yellow-700" },
    1: { label: "Active", color: "bg-green-100 text-green-700" },
    2: { label: "Completed", color: "bg-blue-100 text-blue-700" },
    3: { label: "Trashed", color: "bg-red-100 text-red-700" },
}

function SurveyCard({ surveyId }: { surveyId: bigint }) {
    // Get survey contract address from factory
    const { data: surveyAddress } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'surveys',
        args: [surveyId],
    })

    // Get survey data
    const {
        surveyData,
        metadata,
        isLoading,
        isError
    } = useSurveyDataByAddress(surveyAddress as `0x${string}`)

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isError || !surveyData || !metadata) {
        return null
    }

    const surveyStatus = statusMap[Number(surveyData[7])] || { label: "Unknown", color: "bg-gray-100 text-gray-700" }
    const responseCount = Number(surveyData[5])
    const maxResponses = Number(surveyData[4])

    // Only show active surveys in public listing
    if (Number(surveyData[7]) !== 1) return null

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{metadata.title}</CardTitle>
                    <Badge className={surveyStatus.color}>
                        {surveyStatus.label}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {metadata.description}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {metadata.tags?.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="neutral" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                    {(metadata.tags?.length || 0) > 3 && (
                        <Badge variant="neutral" className="text-xs">
                            +{(metadata.tags?.length || 0) - 3} more
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{responseCount}/{maxResponses}</span>
                        </div>
                        <Badge variant="neutral" className="text-xs">
                            {metadata.category.replace(/_/g, " ")}
                        </Badge>
                    </div>

                    <Button asChild size="sm" variant="neutral">
                        <Link to="/survey/$surveyId" params={{ surveyId: surveyId.toString() }}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Take Survey
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function SurveysListPage() {
    const [searchTerm, setSearchTerm] = useState('')

    // Get total surveys count
    const { data: totalSurveys } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'totalSurveys',
    })

    // Generate array of survey IDs
    const surveyIds = useMemo(() => {
        if (!totalSurveys) return []
        // Factory uses 0-based survey IDs: 0..totalSurveys-1
        return Array.from({ length: Number(totalSurveys) }, (_, i) => BigInt(i))
    }, [totalSurveys])

    return (
        <PageLayout>
            <PageTitle
                title="Public Surveys"
                description="Discover and participate in confidential surveys"
                titleIcon={<MessageCircle />}
                hideAction
            />

            {/* Search and Filters */}
            <Section variant="plain" className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search surveys by title, description, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </Section>

            {/* Survey Grid */}
            <Section title="Available Surveys" description="Participate in active confidential surveys">
                {surveyIds.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No surveys available</h3>
                        <p className="text-muted-foreground">
                            There are currently no active surveys to participate in.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {surveyIds.map((surveyId) => (
                            <SurveyCard key={surveyId.toString()} surveyId={surveyId} />
                        ))}
                    </div>
                )}
            </Section>
        </PageLayout>
    )
}
