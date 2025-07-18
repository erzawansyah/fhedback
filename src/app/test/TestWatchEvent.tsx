"use client"
import { Button } from "@/components/ui/button";
import { abi } from "@/lib/contracts/LikertMultiItemQuestionnaire";
import { FC } from "react";
import { useWatchContractEvent } from "wagmi";

export const TestWatchEvent: FC = () => {
    useWatchContractEvent({
        abi: abi,
        eventName: "QuestionnaireCreated",
        onLogs(log) {
            console.log("Log", log)
        }
    })

    const testClick = () => {
        console.log()
    }



    return (
        <div>
            <Button onClick={testClick}>
                Test Event
            </Button>
        </div>
    );
}
