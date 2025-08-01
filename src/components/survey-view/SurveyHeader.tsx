import { Clock, Users, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface SurveyHeaderProps {
    title: string
    description: string
    category: string
    estimatedTime: number
    reward: number
    currentResponses: number
    maxResponses: number
    progress: number
}

export const SurveyHeader = ({
    title,
    description,
    category,
    estimatedTime,
    reward,
    currentResponses,
    maxResponses,
    progress
}: SurveyHeaderProps) => {
    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{title}</CardTitle>
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <Badge variant="neutral">{category}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{estimatedTime} min</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{currentResponses}/{maxResponses}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>{reward} tokens</span>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardContent>
        </Card>
    )
}
