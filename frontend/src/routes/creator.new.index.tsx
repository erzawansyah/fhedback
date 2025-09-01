// Layout Components
import PageLayout from "@/components/layout/PageLayout";
import PageTitle from "@/components/layout/PageTitle";

import { createFileRoute } from "@tanstack/react-router"
import { FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "../components/ui/switch";
import { transformToSurveyQuestions } from "../utils/survey-transform";
import PlainBox from "../components/layout/PlainBox";
import BasicSurveyCreation from "../components/forms/survey-creation/BasicSurveyCreation";
import { useForm } from "react-hook-form";
import { makeDefaultValues, type FormIn, type FormOut } from "../utils/survey-creation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SurveySubmissionSchema } from "../types/survey.schema";
import AdvancedSurveyCreation from "../components/forms/survey-creation/AdvancedSurveyCreation";
import { useSurveyCreation } from "../hooks/useSurveyCreation";
import { createDb } from "../services/firebase/dbStore";
import { useAccount } from "wagmi";

export const Route = createFileRoute('/creator/new/')({
    component: CreateSurveyPage,
});

function CreateSurveyPage() {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const { address } = useAccount();
    const {
        createSurvey,
        receipt,
    } = useSurveyCreation();
    const form = useForm<FormIn>({
        /** IMPORTANT: resolver and generic both based on the same schema */
        resolver: zodResolver(SurveySubmissionSchema),
        mode: "onChange",
        defaultValues: { ...makeDefaultValues() },
    });

    const toggleAdvancedMode = () => {
        setIsAdvancedMode((prev) => !prev);
    };

    const submitHandler = async (values: FormOut) => {
        let metadataCid: string = "";

        try {
            metadataCid = await createDb("metadata", values.metadata, address);
            console.log("Metadata saved successfully:", metadataCid);
        } catch (e) {
            console.error("Failed to save metadata:", e);
            throw e; // Stop execution early
        }

        try {
            // Transform submission questions to proper SurveyQuestions format
            const surveyQuestions = transformToSurveyQuestions(
                values.questions,
                values.metadata.title // Use title as name
            );

            const questionsCid = await createDb("questions", surveyQuestions, address);
            console.log("Questions saved successfully:", questionsCid);

            const totalQuestions = surveyQuestions.totalQuestions;
            createSurvey({
                metadataCID: metadataCid,
                questionsCID: questionsCid,
                totalQuestions,
                owner: address as `0x${string}`,
                respondentLimit: values.respondentLimit,
                symbol: values.symbol
            });
        } catch (e) {
            console.error("Failed to save questions:", e);
            throw e;
        }
    };

    useEffect(() => {
        if (receipt) {
            console.log("SURVEY CREATED:", receipt);
        }
    }, [receipt]);


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
