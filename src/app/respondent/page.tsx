"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Award, Clock, CheckCircle, Star, ArrowRight, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const RespondentPage = () => {
    const [isLoading, setIsLoading] = useState(true)

    // Mock loading
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock user data
    const userData = {
        name: "Survey Participant",
        totalEarnings: 245,
        completedSurveys: 12,
        averageRating: 4.8,
        currentStreak: 7,
        nextReward: 500,
        level: "Silver Contributor"
    }

    // Mock recent surveys
    const recentSurveys = [
        {
            id: "1",
            title: "AI Technology Adoption Survey",
            completedAt: "2025-01-18T14:30:00Z",
            reward: 25,
            rating: 5,
            status: "completed"
        },
        {
            id: "2",
            title: "Healthcare Digital Transformation",
            completedAt: "2025-01-17T10:15:00Z",
            reward: 30,
            rating: 4,
            status: "completed"
        },
        {
            id: "3",
            title: "Remote Work Productivity Study",
            completedAt: "2025-01-16T16:45:00Z",
            reward: 20,
            rating: 5,
            status: "completed"
        }
    ]

    // Mock available surveys
    const availableSurveys = [
        {
            id: "4",
            title: "Cryptocurrency Investment Behavior",
            estimatedTime: 15,
            reward: 50,
            category: "Finance",
            difficulty: "intermediate"
        },
        {
            id: "5",
            title: "Streaming Platform Preferences",
            estimatedTime: 6,
            reward: 15,
            category: "Entertainment",
            difficulty: "easy"
        },
        {
            id: "6",
            title: "Sustainable Living Habits",
            estimatedTime: 11,
            reward: 18,
            category: "Lifestyle",
            difficulty: "easy"
        }
    ]

    const progressToNextLevel = (userData.totalEarnings / userData.nextReward) * 100

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "text-green-600 bg-green-100"
            case "intermediate": return "text-orange-600 bg-orange-100"
            case "hard": return "text-red-600 bg-red-100"
            default: return "text-gray-600 bg-gray-100"
        }
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
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}!</h1>
                        <p className="text-gray-600">Your survey participation dashboard</p>
                    </div>
                    <Badge variant="neutral" className="text-sm">
                        {userData.level}
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-green-600">{userData.totalEarnings}</p>
                                <p className="text-xs text-gray-500">tokens earned</p>
                            </div>
                            <Award className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{userData.completedSurveys}</p>
                                <p className="text-xs text-gray-500">surveys done</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-yellow-600">{userData.averageRating}</p>
                                <p className="text-xs text-gray-500">quality score</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                                <p className="text-2xl font-bold text-purple-600">{userData.currentStreak}</p>
                                <p className="text-xs text-gray-500">days active</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress to Next Level */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Progress to Gold Contributor</h3>
                        <span className="text-sm text-gray-600">{userData.totalEarnings}/{userData.nextReward} tokens</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">
                        {userData.nextReward - userData.totalEarnings} more tokens to unlock Gold level benefits
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Surveys */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Available Surveys</h2>
                        <Button variant="neutral" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {availableSurveys.map((survey) => (
                            <Card key={survey.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{survey.title}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="neutral" className="text-xs">{survey.category}</Badge>
                                                <Badge
                                                    variant="neutral"
                                                    className={`text-xs ${getDifficultyColor(survey.difficulty)}`}
                                                >
                                                    {survey.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">{survey.reward}</div>
                                            <div className="text-xs text-gray-500">tokens</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>~{survey.estimatedTime} min</span>
                                        </div>
                                        <Button size="sm" className="flex items-center gap-1">
                                            Start Survey
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

                    <div className="space-y-4">
                        {recentSurveys.map((survey) => (
                            <Card key={survey.id}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{survey.title}</h3>
                                        <div className="text-right">
                                            <div className="text-green-600 font-medium">+{survey.reward}</div>
                                            <div className="text-xs text-gray-500">tokens</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Completed {formatDate(survey.completedAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm">{survey.rating}.0</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="mt-4">
                        <CardContent className="pt-6 text-center">
                            <Button variant="neutral" className="w-full">
                                View All Activity
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default RespondentPage
