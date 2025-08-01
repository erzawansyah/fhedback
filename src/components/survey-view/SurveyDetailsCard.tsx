import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Users, Award, User, Hash } from "lucide-react"

interface SurveyDetailsCardProps {
    surveyData: {
        category: string
        estimatedTime: number
        currentResponses: number
        maxResponses: number
        reward: number
        owner: string
        tags: string[]
    }
}

const SurveyDetailsCard = ({ surveyData }: SurveyDetailsCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category</span>
                        <Badge variant="default">{surveyData.category}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <div className="flex items-center space-x-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{surveyData.estimatedTime} min</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Responses</span>
                        <div className="flex items-center space-x-1 text-sm">
                            <Users className="w-4 h-4" />
                            <span>{surveyData.currentResponses}/{surveyData.maxResponses}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reward</span>
                        <div className="flex items-center space-x-1 text-sm font-semibold text-green-600">
                            <Award className="w-4 h-4" />
                            <span>{surveyData.reward} tokens</span>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span>Survey Owner</span>
                    </div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                        {surveyData.owner.slice(0, 6)}...{surveyData.owner.slice(-4)}
                    </div>
                </div>

                {/* Tags Section */}
                {surveyData.tags.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                <Hash className="w-4 h-4" />
                                <span>Tags</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {surveyData.tags.map((tag, index) => (
                                    <Badge key={index} variant="neutral" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default SurveyDetailsCard
