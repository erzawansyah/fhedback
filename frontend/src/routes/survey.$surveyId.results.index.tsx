import { createFileRoute, useParams } from '@tanstack/react-router'
import { useAccount, useReadContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useSurveyDataByAddress } from '../hooks/useSurveyData'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { BarChart, Users, CheckCircle, Lock } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useMemo } from 'react'

export const Route = createFileRoute('/survey/$surveyId/results/')({
  component: SurveyResultsPage,
})

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Created", color: "bg-yellow-100 text-yellow-700" },
  1: { label: "Active", color: "bg-green-100 text-green-700" },
  2: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  3: { label: "Trashed", color: "bg-red-100 text-red-700" },
}

function SurveyResultsPage() {
  const { surveyId } = useParams({ from: '/survey/$surveyId/results/' })
  const { address } = useAccount()

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
    config,
    isLoading,
    isError
  } = useSurveyDataByAddress(surveyAddress as `0x${string}`)

  // Check if current user is the survey owner
  const isOwner = useMemo(() => {
    return address && config?.owner && address.toLowerCase() === config.owner.toLowerCase()
  }, [address, config?.owner])

  // Get survey analytics (placeholder for now since we need to implement FHE decryption)
  const analytics = useMemo(() => {
    if (!surveyData || !questions) return null

    const responseCount = Number(surveyData[5])
    const maxResponses = Number(surveyData[4])
    const completionRate = maxResponses > 0 ? (responseCount / maxResponses) * 100 : 0

    return {
      totalResponses: responseCount,
      maxResponses,
      completionRate,
      // Placeholder analytics - in real implementation, this would come from decrypted FHE data
      questionAnalytics: questions.map((question, index: number) => ({
        questionIndex: index,
        questionText: question.text,
        questionType: question.response.type,
        // Mock data for demonstration
        responses: responseCount,
        averageScore: question.response.type === 'scale' ? 3.7 : null,
        distribution: question.response.type === 'scale' 
          ? [5, 12, 28, 35, 20] // Mock distribution
          : question.response.type === 'nominal' 
            ? [15, 25, 30, 30] // Mock nominal distribution
            : []
      }))
    }
  }, [surveyData, questions])

  const surveyStatus = useMemo(() => {
    if (!surveyData) return null
    const status = Number(surveyData[7])
    return statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-700" }
  }, [surveyData])

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

  if (isError || !surveyData || !metadata) {
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

  if (!isOwner) {
    return (
      <PageLayout>
        <PageTitle
          title="Access Restricted"
          description="You don't have permission to view these results"
          titleIcon={<Lock />}
          hideAction
        />
        
        <Section variant="plain">
          <div className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Owner Access Only</h3>
            <p className="text-muted-foreground">
              Survey results can only be viewed by the survey creator for privacy reasons.
            </p>
          </div>
        </Section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageTitle
        title={`Results: ${metadata.title}`}
        description="Confidential survey analytics and insights"
        titleIcon={<BarChart />}
        hideAction
      />

      {/* Survey Status and Overview */}
      <Section variant="plain" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={surveyStatus?.color}>
                {surveyStatus?.label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-2xl font-bold">
                  {analytics?.totalResponses || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Response Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {analytics?.completionRate.toFixed(1)}%
                </div>
                <Progress value={analytics?.completionRate || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-2xl font-bold">
                  {questions?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Privacy Notice */}
      <Alert className="mb-6">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> All individual responses are encrypted using Fully Homomorphic Encryption (FHE). 
          Only aggregate statistics are available to protect participant privacy. To view detailed analytics, 
          the survey must be completed and results decrypted.
        </AlertDescription>
      </Alert>

      {/* Question-by-Question Analytics */}
      {analytics?.questionAnalytics && (
        <Section title="Question Analytics" description="Detailed breakdown by question">
          <div className="space-y-6">
            {analytics.questionAnalytics.map((qa, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  <p className="text-muted-foreground">{qa.questionText}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Responses:</span>
                    <Badge variant="neutral">{qa.responses}</Badge>
                  </div>

                  {qa.questionType === 'scale' && qa.averageScore && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Score:</span>
                        <Badge variant="neutral">{qa.averageScore}/5</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Score Distribution:</p>
                        {qa.distribution.map((count: number, scoreIndex: number) => (
                          <div key={scoreIndex} className="flex items-center gap-3">
                            <span className="text-xs w-4">{scoreIndex + 1}</span>
                            <Progress 
                              value={qa.responses > 0 ? (count / qa.responses) * 100 : 0} 
                              className="flex-1 h-2" 
                            />
                            <span className="text-xs w-8">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {qa.questionType === 'nominal' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Option Distribution:</p>
                      {qa.distribution.map((count: number, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <span className="text-xs w-12">Option {optionIndex + 1}</span>
                          <Progress 
                            value={qa.responses > 0 ? (count / qa.responses) * 100 : 0} 
                            className="flex-1 h-2" 
                          />
                          <span className="text-xs w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* FHE Decryption Notice */}
      {surveyStatus?.label === 'Completed' && (
        <Section variant="highlighted" className="mt-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Ready for Full Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Your survey is completed! In a production environment, you would be able to decrypt 
              the full results using your private key to get detailed, privacy-preserving analytics.
            </p>
            <Badge variant="neutral">
              FHE Decryption Required for Full Results
            </Badge>
          </div>
        </Section>
      )}
    </PageLayout>
  )
}
