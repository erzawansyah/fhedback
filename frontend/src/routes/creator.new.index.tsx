// Layout Components
import PageLayout from "@/components/layout/PageLayout";
import PageTitle from "@/components/layout/PageTitle";

import { createFileRoute } from "@tanstack/react-router"
import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { Switch } from "../components/ui/switch";
import PlainBox from "../components/layout/PlainBox";
import BasicSurveyCreation from "../components/forms/survey-creation/BasicSurveyCreation";
import { useForm } from "react-hook-form";
import { makeDefaultValues, type FormIn, type FormOut } from "../utils/survey-creation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SurveySubmissionSchema } from "../types/survey.schema";
import AdvancedSurveyCreation from "../components/forms/survey-creation/AdvancedSurveyCreation";

export const Route = createFileRoute('/creator/new/')({
    component: CreateSurveyPage,
});

function CreateSurveyPage() {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const form = useForm<FormIn>({
        /** PENTING: resolver dan generic sama-sama berdasarkan schema yang sama */
        resolver: zodResolver(SurveySubmissionSchema),
        mode: "onChange",
        defaultValues: { ...makeDefaultValues() },
    });

    const toggleAdvancedMode = () => {
        setIsAdvancedMode((prev) => !prev);
    };

    const submitHandler = async (values: FormOut) => {
        // Values sudah berupa FormOut dari form.handleSubmit
        console.log("VALID SUBMISSION:", values);
    };

    return (
        <PageLayout>
            <PageTitle
                title="Create New Survey"
                description="Design your confidential survey with custom questions and settings."
                titleIcon={<FileTextIcon />}
                hideAction
            />
            <PlainBox className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Advanced Mode</h2>
                    <p className="text-sm text-muted-foreground">
                        Enable advanced features for survey creation.
                    </p>
                </div>
                <Switch checked={isAdvancedMode} onCheckedChange={toggleAdvancedMode} />
            </PlainBox>
            {
                isAdvancedMode ? (
                    <AdvancedSurveyCreation />
                ) : (
                    <BasicSurveyCreation form={form} handleSubmit={submitHandler} />
                )
            }
        </PageLayout>
    );
}
