"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, BarChart3, Users, Eye, Edit, Trash2, TrendingUp, Clock, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const CreatorPage = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    // Mock loading
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock creator data
    // TODO: Replace with actual data, fetching logic. Use custom hooks for this data
    const creatorData = {
        name: "Survey Creator",
        totalSurveys: 8,
        totalResponses: 1247,
        totalSpent: 3850,
        averageRating: 4.6,
        activeSurveys: 3,
        completedSurveys: 5
    }

    // Mock surveys data
    const surveys = [
        {
            id: "1",
            title: "AI Technology Adoption in Workplace",
            status: "active",
            responses: 156,
            maxResponses: 200,
            createdAt: "2025-01-15",
            reward: 25,
            category: "Technology",
            averageRating: 4.6,
            estimatedCompletion: "2 days"
        },
        {
            id: "2",
            title: "Healthcare Digital Transformation",
            status: "active",
            responses: 89,
            maxResponses: 150,
            createdAt: "2025-01-14",
            reward: 30,
            category: "Healthcare",
            averageRating: 4.3,
            estimatedCompletion: "5 days"
        },
        {
            id: "3",
            title: "Remote Work Productivity Study",
            status: "completed",
            responses: 250,
            maxResponses: 250,
            createdAt: "2025-01-10",
            reward: 20,
            category: "Business",
            averageRating: 4.8,
            estimatedCompletion: "Completed"
        },
        {
            id: "4",
            title: "Online Learning Effectiveness",
            status: "draft",
            responses: 0,
            maxResponses: 300,
            createdAt: "2025-01-18",
            reward: 22,
            category: "Education",
            averageRating: 0,
            estimatedCompletion: "Draft"
        },
        {
            id: "5",
            title: "Cryptocurrency Investment Behavior",
            status: "completed",
            responses: 500,
            maxResponses: 500,
            createdAt: "2025-01-05",
            reward: 50,
            category: "Finance",
            averageRating: 4.9,
            estimatedCompletion: "Completed"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "text-green-600 bg-green-100"
            case "completed": return "text-blue-600 bg-blue-100"
            case "draft": return "text-gray-600 bg-gray-100"
            case "paused": return "text-orange-600 bg-orange-100"
            default: return "text-gray-600 bg-gray-100"
        }
    }

    const getProgressPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100)
    }

    const handleCreateSurvey = () => {
        router.push("/creator/new")
    }

    const handleViewAnalytics = (surveyId: string) => {
        router.push(`/creator/analytics?survey=${surveyId}`)
    }

    const handleEditSurvey = (surveyId: string) => {
        console.log("Edit survey:", surveyId)
    }

    const handleDeleteSurvey = (surveyId: string) => {
        console.log("Delete survey:", surveyId)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
                        <p className="text-gray-600">Manage your surveys and track performance</p>
                    </div>
                    <Button onClick={handleCreateSurvey} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Survey
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                                <p className="text-2xl font-bold text-blue-600">{creatorData.totalSurveys}</p>
                                <p className="text-xs text-gray-500">{creatorData.activeSurveys} active</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                                <p className="text-2xl font-bold text-green-600">{creatorData.totalResponses}</p>
                                <p className="text-xs text-gray-500">across all surveys</p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                <p className="text-2xl font-bold text-purple-600">{creatorData.totalSpent}</p>
                                <p className="text-xs text-gray-500">tokens distributed</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-yellow-600">{creatorData.averageRating}</p>
                                <p className="text-xs text-gray-500">survey quality</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Surveys List */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Surveys</h2>
                    <div className="flex gap-2">
                        <Badge variant="neutral">All ({surveys.length})</Badge>
                        <Badge variant="neutral">Active ({surveys.filter(s => s.status === 'active').length})</Badge>
                        <Badge variant="neutral">Completed ({surveys.filter(s => s.status === 'completed').length})</Badge>
                    </div>
                </div>

                <div className="space-y-4">
                    {surveys.map((survey) => (
                        <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{survey.title}</h3>
                                            <Badge
                                                variant="neutral"
                                                className={`text-xs ${getStatusColor(survey.status)}`}
                                            >
                                                {survey.status}
                                            </Badge>
                                            <Badge variant="neutral" className="text-xs">
                                                {survey.category}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Created:</span> {survey.createdAt}
                                            </div>
                                            <div>
                                                <span className="font-medium">Reward:</span> {survey.reward} tokens
                                            </div>
                                            <div>
                                                <span className="font-medium">Rating:</span> {survey.averageRating > 0 ? survey.averageRating : 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Completion:</span> {survey.estimatedCompletion}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => handleViewAnalytics(survey.id)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            View
                                        </Button>
                                        {survey.status === 'draft' && (
                                            <Button
                                                variant="neutral"
                                                size="sm"
                                                onClick={() => handleEditSurvey(survey.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Edit className="w-3 h-3" />
                                                Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="neutral"
                                            size="sm"
                                            onClick={() => handleDeleteSurvey(survey.id)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress Bar for Active Surveys */}
                                {survey.status === 'active' && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Response Progress</span>
                                            <span>{survey.responses}/{survey.maxResponses}</span>
                                        </div>
                                        <Progress
                                            value={getProgressPercentage(survey.responses, survey.maxResponses)}
                                            className="h-2"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="neutral" className="h-20 flex-col gap-2">
                            <Plus className="w-6 h-6" />
                            <span>Create New Survey</span>
                        </Button>
                        <Button variant="neutral" className="h-20 flex-col gap-2">
                            <BarChart3 className="w-6 h-6" />
                            <span>View Analytics</span>
                        </Button>
                        <Button variant="neutral" className="h-20 flex-col gap-2">
                            <Clock className="w-6 h-6" />
                            <span>Manage Drafts</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreatorPage
