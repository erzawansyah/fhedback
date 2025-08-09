import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";

interface SurveyFormActionsProps {
    isCreateDisabled: boolean;
    action_text?: string;
    isLoading?: boolean;
    cancelHref?: string;
}

export function SurveyFormActions({
    isCreateDisabled,
    action_text = "Create Survey",
    isLoading = false,
    cancelHref = "/"
}: SurveyFormActionsProps) {
    return (
        <div className="mt-6 flex gap-4">
            <Button
                asChild
                variant="neutral"
                size="lg"
                className="font-heading w-full"
                type="button"
            >
                <Link href={cancelHref}>Cancel</Link>
            </Button>
            {
                isLoading ? (
                    <Button
                        size="lg"
                        className="font-heading w-full"
                        disabled
                    >
                        <LoaderIcon className="animate-spin h-4 w-4 mr-2" />
                        {action_text}
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="font-heading w-full cursor-pointer"
                        type="submit"
                        disabled={isCreateDisabled}
                    >
                        {action_text}
                    </Button>
                )
            }
        </div>
    );
}
