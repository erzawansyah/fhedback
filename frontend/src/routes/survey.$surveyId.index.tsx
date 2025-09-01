import { createFileRoute, useParams } from '@tanstack/react-router'
import { useAccount, useReadContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { MessageCircle, Users, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useMemo, useState } from 'react'
import SurveyResponseForm from '../components/forms/SurveyResponseForm'

export const Route = createFileRoute('/survey/$surveyId/')({
    component: SurveyParticipationPage,
})

const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: "Created", color: "bg-yellow-100 text-yellow-700" },
    1: { label: "Active", color: "bg-green-100 text-green-700" },
    2: { label: "Completed", color: "bg-blue-100 text-blue-700" },
    3: { label: "Trashed", color: "bg-red-100 text-red-700" },
}

function SurveyParticipationPage() {
    const { surveyId } = useParams({ from: '/survey/$surveyId/' })
    const { address } = useAccount()
    const [hasSubmitted, setHasSubmitted] = useState(false)

    // Get survey contract address from factory
    const { data: surveyAddress } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'surveys',
        args: [BigInt(surveyId)],
    })

  // Get survey data
  const {
    surveyData,
    metadata,
    questions,
    isLoading,
    isError
  } = useSurveyDataByAddress(surveyAddress as `0x${string}`)    // Check if user has already responded
    const { data: hasResponded } = useReadContract({
        address: surveyAddress as `0x${string}`,
        abi: ABIS.survey,
        functionName: 'hasResponded',
        args: [address],
        query: {
            enabled: !!surveyAddress && !!address
        }
    })

    const canParticipate = useMemo(() => {
        if (!surveyData || !address) return false
        if (hasResponded || hasSubmitted) return false
        return Number(surveyData[7]) === 1 // Status: Active
    }, [surveyData, address, hasResponded, hasSubmitted])

    const surveyStatus = useMemo(() => {
        if (!surveyData) return null
        const status = Number(surveyData[7])
        return statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-700" }
    }, [surveyData])

    // Ensure instructions is a string to satisfy ReactNode children typing
    const instructionsText: string = typeof metadata?.instructions === 'string' ? metadata.instructions : ''

    if (isLoading) {
        return (
            <PageLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </PageLayout>
        )
    }

    if (isError || !surveyData) {
        return (
            <PageLayout>
                <Alert variant="destructive">
                    <AlertDescription>
                        Survey not found or failed to load. Please check the survey ID.
                    </AlertDescription>
                </Alert>
            </PageLayout>
        )
    }

    const responseCount = Number(surveyData[5])
    const maxResponses = Number(surveyData[4])

    return (
        <PageLayout>
            <PageTitle
                title={metadata?.title || `Survey #${surveyId}`}
                description={metadata?.description || 'Confidential survey participation'}
                titleIcon={<MessageCircle />}
                hideAction
            />

            {/* Survey Status and Info */}
            <Section variant="plain" className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <Badge className={surveyStatus?.color}>
                        {surveyStatus?.label}
                    </Badge>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{responseCount}/{maxResponses} responses</span>
                    </div>

                    {questions && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span>{questions.length} questions</span>
                        </div>
                    )}
                </div>
            </Section>

            {/* Instructions */}
            {instructionsText && (
                <Section title="Instructions" variant="plain" className="mb-6">
                    <p className="text-foreground/80">{instructionsText}</p>
                </Section>
            )}

            {/* Response Status Alerts */}
            {hasResponded && (
                <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        You have already submitted a response to this survey. Thank you for your participation!
                    </AlertDescription>
                </Alert>
            )}

            {hasSubmitted && (
                <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        Response submitted successfully! Your encrypted responses have been recorded.
                    </AlertDescription>
                </Alert>
            )}

            {surveyStatus?.label === "Completed" && (
                <Alert className="mb-6">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                        This survey has been completed and is no longer accepting responses.
                    </AlertDescription>
                </Alert>
            )}

            {surveyStatus?.label === "Created" && (
                <Alert className="mb-6">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                        This survey is not yet active. Please check back later.
                    </AlertDescription>
                </Alert>
            )}

            {/* Survey Form */}
            {canParticipate && questions && surveyAddress ? (
                <SurveyResponseForm
                    surveyAddress={surveyAddress as `0x${string}`}
                    questions={questions}
                    onSubmitSuccess={() => setHasSubmitted(true)}
                />
            ) : !canParticipate && address && (
                <Section variant="plain">
                    <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Cannot participate in this survey</h3>
                        <p className="text-muted-foreground">
                            {hasResponded ? "You have already responded to this survey." :
                                surveyStatus?.label === "Completed" ? "This survey is no longer accepting responses." :
                                    surveyStatus?.label === "Created" ? "This survey is not yet active." :
                                        "You cannot participate in this survey at this time."}
                        </p>
                    </div>
                </Section>
            )}

            {!address && (
                <Section variant="plain">
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Connect your wallet</h3>
                        <p className="text-muted-foreground mb-4">
                            Please connect your wallet to participate in this survey.
                        </p>
                        <Button>Connect Wallet</Button>
                    </div>
                </Section>
            )}
        </PageLayout>
    )
}
