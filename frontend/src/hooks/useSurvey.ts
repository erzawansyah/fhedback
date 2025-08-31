import { useReadContract } from "wagmi";
import { ABIS, FACTORY_ADDRESS } from "../services/contracts";
import { useMemo } from "react";
import type { Address } from "viem";

type SurveyData = {
    owner: Address;
    symbol: string;
    metadataCID: string;
    questionsCID: string;
    totalQuestions: number;
    respondentLimit: number;
    createdAt: Date;
    status: number;
}

type SurveyDataRaw = [
    Address,
    string,
    string,
    string,
    number,
    number,
    Date,
    number
];

export function useSurvey(surveyId: number) {
    const {
        data: surveyAddressRaw,
        isLoading: addressLoading,
        isError: addressError
    } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: ABIS.factory,
        functionName: 'surveys',
        args: [surveyId],
    });

    const surveyAddress = useMemo(() => {
        if (!surveyAddressRaw) return null;
        return surveyAddressRaw as `0x${string}`;
    }, [surveyAddressRaw]);

    const {
        data,
        isLoading: dataLoading,
        isError: dataError
    } = useReadContract({
        address: surveyAddress!,
        abi: ABIS.survey,
        functionName: 'survey',
        query: {
            enabled: !!surveyAddress && !addressLoading && !addressError
        }
    });

    const surveyData = useMemo(() => {
        if (!data) return null;
        const d = data as SurveyDataRaw;
        return {
            owner: d[0],
            symbol: d[1],
            metadataCID: d[2],
            questionsCID: d[3],
            totalQuestions: d[4],
            respondentLimit: d[5],
            createdAt: new Date(Number(d[6]) * 1000),
            status: d[7]
        } as SurveyData;
    }, [data]);

    return {
        data: surveyData,
        isLoading: addressLoading || dataLoading,
        isError: addressError || dataError,
        surveyAddress
    };
}
