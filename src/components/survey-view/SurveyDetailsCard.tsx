import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Clock, Users, Award, User, Hash, ChevronDown } from "lucide-react"
import { useState } from "react"

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
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="pb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:opacity-80 transition-all duration-200 [&[data-state=open]>svg]:rotate-180">
                        <CardTitle className="text-lg">Survey Details</CardTitle>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </CollapsibleTrigger>

                    {/* Quick Info - Always visible when collapsed */}
                    {!isOpen && (
                        <div className="pt-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Category</span>
                                <Badge variant="default" className="text-xs">{surveyData.category}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Reward</span>
                                <div className="flex items-center space-x-1 text-xs font-semibold text-green-600">
                                    <Award className="w-3 h-3" />
                                    <span>{surveyData.reward} tokens</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CollapsibleContent className="collapsible-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 duration-200">
                    <CardContent className="pt-0 space-y-4">
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
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}

export default SurveyDetailsCard
