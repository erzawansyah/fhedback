"use client"
import { usePublishedSurveys } from "@/hooks/usePublishedSurveys"
import { Card, CardContent } from "../ui/card"
import { SurveyCard } from "./SurveyCard"

export const SurveyExplorer = () => {
    const { surveys, isLoading } = usePublishedSurveys()

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
        <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map((survey) => (
                <SurveyCard key={survey.address} {...survey} />
            ))}
        </div>
    )
}
