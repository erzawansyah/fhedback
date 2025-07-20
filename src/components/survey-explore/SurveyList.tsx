"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Clock, Users, Star, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock survey data type
export interface PublishedSurvey {
    id: string
    title: string
    description: string
    category: string
    creator: string
    createdAt: string
    totalQuestions: number
    respondentCount: number
    maxRespondents: number
    rewardAmount: number
    averageRating?: number
    estimatedTime: number // in minutes
    tags: string[]
    isActive: boolean
    hasAnswered?: boolean
}

interface SurveyListProps {
    surveys: PublishedSurvey[]
    onSurveyClick: (survey: PublishedSurvey) => void
    isLoading?: boolean
}

export const SurveyList = ({ surveys, onSurveyClick, isLoading = false }: SurveyListProps) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("newest")
    const [filteredSurveys, setFilteredSurveys] = useState<PublishedSurvey[]>(surveys)

    // Filter and sort surveys
    useEffect(() => {
        const filtered = surveys.filter(survey =>
            survey.isActive &&
            survey.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "all" || survey.category === selectedCategory)
        )

        // Sort surveys
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "reward":
                    return b.rewardAmount - a.rewardAmount
                case "popularity":
                    return b.respondentCount - a.respondentCount
                case "rating":
                    return (b.averageRating || 0) - (a.averageRating || 0)
                default:
                    return 0
            }
        })

        setFilteredSurveys(filtered)
    }, [surveys, searchTerm, selectedCategory, sortBy])

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) return "Today"
        if (diffInDays === 1) return "Yesterday"
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
        return `${Math.floor(diffInDays / 30)} months ago`
    }

    const getProgressPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search surveys..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-48">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="reward">Highest Reward</SelectItem>
                            <SelectItem value="popularity">Most Popular</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-sm text-gray-600">
                    Showing {filteredSurveys.length} of {surveys.length} surveys
                </div>
            </div>

            {/* Survey Cards */}
            {filteredSurveys.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSurveys.map((survey) => (
                        <Card
                            key={survey.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer group"
                            onClick={() => onSurveyClick(survey)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="neutral" className="text-xs">
                                        {survey.category}
                                    </Badge>
                                    {survey.hasAnswered && (
                                        <Badge variant="default" className="text-xs">
                                            Completed
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {survey.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {survey.description}
                                </p>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {/* Creator and Time */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>by {survey.creator}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(survey.createdAt)}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            <span>{survey.totalQuestions} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>~{survey.estimatedTime} min</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                Responses
                                            </span>
                                            <span>{survey.respondentCount}/{survey.maxRespondents}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${getProgressPercentage(survey.respondentCount, survey.maxRespondents)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Reward and Rating */}
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium text-green-600">
                                            {survey.rewardAmount > 0 ? `${survey.rewardAmount} tokens` : "Free"}
                                        </div>
                                        {survey.averageRating && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span>{survey.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {survey.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {survey.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {survey.tags.length > 3 && (
                                                <span className="text-xs text-gray-400">
                                                    +{survey.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <Button
                                        className="w-full"
                                        variant={survey.hasAnswered ? "neutral" : "default"}
                                        disabled={survey.respondentCount >= survey.maxRespondents}
                                    >
                                        {survey.hasAnswered
                                            ? "View Response"
                                            : survey.respondentCount >= survey.maxRespondents
                                                ? "Survey Full"
                                                : "Take Survey"
                                        }
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
