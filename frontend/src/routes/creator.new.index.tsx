// Layout Components
import PageLayout from "@/components/layout/PageLayout";
import PageTitle from "@/components/layout/PageTitle";

import { createFileRoute } from "@tanstack/react-router"
import { FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "../components/ui/switch";
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
        isConfirming,
        isConfirmed,
    } = useSurveyCreation();
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
        let metadataCid: string = "";

        try {
            metadataCid = await createDb("metadata", values.metadata, address);
            console.log("metadata OK:", metadataCid);
        } catch (e) {
            console.error("GAGAL tulis METADATA:", e);
            throw e; // stop lebih awal
        }

        try {
            const questionsCid = await createDb("questions", values.questions, address);
            console.log("questions OK:", questionsCid);

            const totalQuestions = values.questions.length;
            createSurvey({
                metadataCID: metadataCid,
                questionsCID: questionsCid,
                totalQuestions,
                owner: address as `0x${string}`,
                respondenLimit: values.respondentLimit,
                symbol: values.symbol
            });
        } catch (e) {
            console.error("GAGAL tulis QUESTIONS:", e);
            throw e;
        }
    };

    console.log("Confirming:", isConfirming);
    console.log("Confirmed:", isConfirmed);

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
