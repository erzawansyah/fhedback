import React from "react";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SurveyCreationHeaderProps {
    title?: string;
    description?: string;
    disclaimer?: string;
}

export function SurveyCreationHeader({
    title = "Create New Survey",
    description = "Please fill in your survey details below. All data entered in this form will be securely stored on the blockchain.",
    disclaimer = "Note: Currently, creating a survey is free. However, in the future, a fee may be applied based on the requirements specified during survey creation.",
}: SurveyCreationHeaderProps) {
    return (
        <>
            {/* Title Section */}
            <Card className="w-full bg-secondary-background">
                <CardContent className="flex items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-heading text-foreground">
                            {title}
                        </h1>
                        <p className="text-subtle mt-2">
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Fee Disclaimer */}
            <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Platform Fee Disclaimer</AlertTitle>
                <AlertDescription>
                    {disclaimer}
                </AlertDescription>
            </Alert>
        </>
    );
}
