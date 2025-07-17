"use client"
import { FC } from "react";
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { QuestionnaireMetadata } from "@/lib/interfaces/questionnaire"
import { Badge } from "./ui/badge";
import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import Link from "next/link";


interface SurveyCardProps {
    survey: QuestionnaireMetadata
}

export const SurveyCard: FC<SurveyCardProps> = ({ survey }) => {
    const [progress, setProgress] = React.useState<number>(0.0)

    React.useEffect(() => {
        const max = survey.respondentLimit
        const current = survey.totalRespondents
        const currentProgress = Math.floor((current / max * 100) * 10) / 10
        setTimeout(() => {
            setProgress(currentProgress)
        }, 500)
    }, [survey.totalRespondents, survey.respondentLimit])

    return (
        <Card className="bg-secondary-background h-full">
            <CardHeader>
                <div className="flex justify-between">

                    <Badge>
                        Created {" "}
                        {survey.createdAt.toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })}
                    </Badge>
                </div>
                <CardTitle className="text-xl">
                    {survey.title}
                </CardTitle>
                {
                    survey.description && (
                        <CardDescription
                            style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            className="line-clamp-2"
                        >
                            {survey.description.trim()}
                        </CardDescription>
                    )
                }
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <CardDescription>
                        Questions:
                    </CardDescription>
                    <Badge>
                        {survey.totalQuestions}
                    </Badge>
                </div>
                <div className="flex justify-between">
                    <CardDescription>
                        Scale:
                    </CardDescription>
                    <Badge>
                        1-{survey.scaleLimit}
                    </Badge>
                </div>
                <div className="flex justify-between">
                    <CardDescription>
                        Max Participant:
                    </CardDescription>
                    <Badge>
                        {survey.respondentLimit}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="block">
                <Progress value={progress} />
                <p className="text-xs text-center mt-1">{progress}% before mature</p>
                <div className="flex gap-4 mt-4">
                    <Button asChild variant={"reverse"} className="w-full cursor-pointer bg-secondary-background hover:bg-background">
                        <Link href={"/statistic/" + survey.id}>View Statistic</Link>
                    </Button>
                    <Button variant={"reverse"} className="w-full cursor-pointer">
                        Take Survey
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
