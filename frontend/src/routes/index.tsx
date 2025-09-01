import { createFileRoute, Link } from '@tanstack/react-router'
import PageTitle from '../components/layout/PageTitle'
import Section from '../components/layout/Section'
import { HomeIcon, MessageCircle, BarChart, Users, Zap } from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAccount, useReadContract } from 'wagmi'
import { ABIS, FACTORY_ADDRESS } from '../services/contracts'
import { useMemo } from 'react'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    const { address, isConnected } = useAccount()
    
    // Get user's survey count
    const { data: userSurveys } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'getSurveysByOwner',
        args: [address],
        query: { enabled: isConnected && !!address }
    })

    // Get total surveys count
    const { data: totalSurveys } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'totalSurveys',
    })

    const stats = useMemo(() => {
        return {
            mySurveys: Array.isArray(userSurveys) ? userSurveys.length : 0,
            totalSurveys: totalSurveys ? Number(totalSurveys) : 0
        }
    }, [userSurveys, totalSurveys])

    return (
        <PageLayout>
            <PageTitle
                title="Welcome to FHEdback"
                description="Create and participate in fully confidential surveys powered by Zama's FHEVM"
                titleIcon={<HomeIcon />}
                hideAction
            />

            {/* Hero Section */}
            <Section variant="highlighted" className="mb-8">
                <div className="text-center space-y-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">
                            Privacy-First Survey Platform
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Conduct surveys with complete participant privacy using Fully Homomorphic Encryption (FHE). 
                            Collect insights without compromising individual responses.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/creator/new">
                                <Button size="lg">
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Create Survey
                                </Button>
                            </Link>
                            <Link to="/surveys">
                                <Button variant="neutral" size="lg">
                                    <Users className="mr-2 h-5 w-5" />
                                    Browse Surveys
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Stats Cards */}
            <Section title="Platform Overview" description="Current platform statistics and your activity">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Surveys
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-blue-500" />
                                <span className="text-2xl font-bold">
                                    {stats.totalSurveys}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Surveys deployed on platform
                            </p>
                        </CardContent>
                    </Card>

                    {isConnected ? (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    My Surveys
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-2xl font-bold">
                                        {stats.mySurveys}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Surveys you've created
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Connect Wallet
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Connect your wallet to get started
                                    </p>
                                    <Button size="sm">Connect Wallet</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Technology
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-purple-500" />
                                <span className="text-sm font-bold">FHEVM</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Powered by Zama's FHE
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Section>

            {/* Quick Actions */}
            <Section title="Quick Actions" description="Get started with common tasks">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link to="/creator/new" className="block">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MessageCircle className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Create New Survey</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Design a confidential survey with custom questions
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Badge variant="neutral">Privacy-First</Badge>
                                    <span className="text-sm text-muted-foreground">→</span>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link to="/surveys" className="block">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Browse Surveys</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Participate in active confidential surveys
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Badge variant="neutral">Anonymous</Badge>
                                    <span className="text-sm text-muted-foreground">→</span>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </Section>

            {/* Features */}
            <Section title="Why FHEdback?" description="Key benefits of our privacy-first approach">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center space-y-3">
                        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Fully Homomorphic Encryption</h3>
                        <p className="text-sm text-muted-foreground">
                            Responses are encrypted end-to-end using cutting-edge FHE technology, 
                            ensuring complete privacy while enabling statistical analysis.
                        </p>
                    </div>

                    <div className="text-center space-y-3">
                        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Anonymous Participation</h3>
                        <p className="text-sm text-muted-foreground">
                            Participants can respond honestly without fear of identification, 
                            leading to more accurate and unbiased survey results.
                        </p>
                    </div>

                    <div className="text-center space-y-3">
                        <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                            <BarChart className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Statistical Insights</h3>
                        <p className="text-sm text-muted-foreground">
                            Get meaningful aggregate statistics and insights from your survey data 
                            without accessing individual responses.
                        </p>
                    </div>
                </div>
            </Section>
        </PageLayout>
    )
}
