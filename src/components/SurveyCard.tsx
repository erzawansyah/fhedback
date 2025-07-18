"use client";

import { FC, useState, useEffect, useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionnaireMetadata } from "@/lib/interfaces/questionnaire";
import { formatDate } from "@/utils/date";
import {
    calculateSurveyProgress,
    isSurveyCompleted,
    formatSurveyScale
} from "@/utils/survey";
import { ROUTES, ANIMATION_DURATIONS } from "@/lib/constants";

interface SurveyCardProps {
    survey: QuestionnaireMetadata;
}

interface SurveyInfoItemProps {
    label: string;
    value: string | number;
}

const SurveyInfoItem: FC<SurveyInfoItemProps> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <CardDescription className="text-sm text-muted">
            {label}:
        </CardDescription>
        <Badge variant="neutral" className="text-xs">
            {value}
        </Badge>
    </div>
);

export const SurveyCard: FC<SurveyCardProps> = ({ survey }) => {
    const [progress, setProgress] = useState<number>(0);

    const progressPercentage = useMemo(() =>
        calculateSurveyProgress(survey.totalRespondents, survey.respondentLimit),
        [survey.totalRespondents, survey.respondentLimit]
    );

    const formattedDate = useMemo(() =>
        formatDate(survey.createdAt, "SHORT"),
        [survey.createdAt]
    );

    const isCompleted = useMemo(() =>
        isSurveyCompleted(survey),
        [survey]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(progressPercentage);
        }, ANIMATION_DURATIONS.NORMAL);

        return () => clearTimeout(timer);
    }, [progressPercentage]);

    return (
        <Card className="bg-secondary-background h-full border-2 border-border shadow-shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200">
            <CardHeader className="space-y-3">
                <div className="flex justify-between items-start">
                    <Badge variant="default" className="text-xs">
                        Created {formattedDate}
                    </Badge>
                    {isCompleted && (
                        <Badge variant="neutral" className="text-xs bg-error-bg text-error">
                            Completed
                        </Badge>
                    )}
                </div>

                <CardTitle className="text-xl leading-tight line-clamp-2">
                    {survey.title}
                </CardTitle>

                {survey.description && (
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {survey.description.trim()}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-3">
                <SurveyInfoItem
                    label="Questions"
                    value={survey.totalQuestions}
                />
                <SurveyInfoItem
                    label="Scale"
                    value={formatSurveyScale(survey.scaleLimit)}
                />
                <SurveyInfoItem
                    label="Max Participants"
                    value={survey.respondentLimit}
                />
                <SurveyInfoItem
                    label="Current Participants"
                    value={`${survey.totalRespondents}/${survey.respondentLimit}`}
                />
            </CardContent>

            <CardFooter className="flex-col space-y-4">
                <div className="w-full space-y-2">
                    <Progress
                        value={progress}
                        className="h-2"
                    />
                    <p className="text-xs text-center text-muted">
                        {progress}% completed
                    </p>
                </div>

                <div className="flex gap-2 w-full">
                    <Button
                        asChild
                        variant="neutral"
                        size="sm"
                        className="flex-1"
                    >
                        <Link href={ROUTES.STATISTICS(survey.id)}>
                            View Stats
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant={isCompleted ? "neutral" : "default"}
                        size="sm"
                        className="flex-1"
                        disabled={isCompleted}
                    >
                        <Link href={ROUTES.SUBMIT(survey.id)}>
                            {isCompleted ? "Full" : "Take Survey"}
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
