"use client";
import useSyncedState from '@/hooks/use-synced-state';
import { QUESTIONNAIRE_ABIS, QUESTIONNAIRE_FACTORY_ADDRESS } from '@/lib/contracts';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Address } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';

interface SurveyConfig {
    address: Address | null;
    status: string | null;
    title: string;
    isFhe: boolean;
    limitScale: number;
    totalQuestions: number;
    respondentLimit: number;
}

interface SurveyCreationContextType {
    config: SurveyConfig;
    setSurveyAddress: (address: Address | null) => void;
    resetSurveyConfig: () => void;
}


const SurveyCreationContext = createContext<SurveyCreationContextType | undefined>(undefined);

const defaultSurveyConfig: SurveyConfig = {
    address: null,
    title: '',
    status: null,
    isFhe: false,
    limitScale: 0,
    totalQuestions: 0,
    respondentLimit: 0,
};

const abis = QUESTIONNAIRE_ABIS
const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS
const questionnaireStatus = [
    "initialized",
    "draft",
    "published",
    "closed",
    "trashed",
]
export const SurveyCreationProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state from localStorage or default config
    const [config, setConfig, removeConfig] = useSyncedState<SurveyConfig>("surveyConfig", defaultSurveyConfig);
    const { data: surveyType, isSuccess: surveyTypeFetched } = useReadContract({
        address: factoryAddress as Address,
        abi: abis.factory,
        functionName: "getQuestionnaireType",
        args: [config.address as Address],
    })

    const surveyContract = {
        address: config.address as Address | undefined,
        abi: abis.general,
    } as const;
    const { data: surveyData, isSuccess: surveyDataFetched } = useReadContracts({
        contracts: [
            {
                ...surveyContract,
                functionName: "title",
                args: [],
            }, {
                ...surveyContract,
                functionName: "scaleLimit",
                args: [],
            },
            {
                ...surveyContract,
                functionName: "questionLimit",
                args: [],
            }, {
                ...surveyContract,
                functionName: "respondentLimit",
                args: [],
            },
            {
                ...surveyContract,
                functionName: "status",
                args: [],
            }
        ]
    });



    const setSurveyAddress = (address: Address | null) => {
        setConfig(prev => ({ ...prev, address }));
    };

    const resetSurveyConfig = () => {
        setConfig(defaultSurveyConfig);
        removeConfig();
    };

    // If address set, get the survey config from the blockchain
    useEffect(() => {
        if (config.address && surveyTypeFetched && surveyDataFetched) {
            const [titleRes, scaleLimitRes, questionLimitRes, respondentLimitRes, statusRes] = surveyData || [];
            const title = titleRes?.status === 'success' ? titleRes.result : '';
            const scaleLimit = scaleLimitRes?.status === 'success' ? scaleLimitRes.result : 0;
            const questionLimit = questionLimitRes?.status === 'success' ? questionLimitRes.result : 0;
            const respondentLimit = respondentLimitRes?.status === 'success' ? respondentLimitRes.result : 0;
            const status = statusRes?.status === 'success' ? statusRes.result : null;


            setConfig(prev => ({
                ...prev,
                title: typeof title === 'string' ? title : String(title ?? ''),
                status: typeof status === 'number' ? questionnaireStatus[status] : String(questionnaireStatus[Number(status)] ?? ''),
                limitScale: typeof scaleLimit === 'number' ? scaleLimit : Number(scaleLimit ?? 0),
                totalQuestions: typeof questionLimit === 'number' ? questionLimit : Number(questionLimit ?? 0),
                respondentLimit: typeof respondentLimit === 'number' ? respondentLimit : Number(respondentLimit ?? 0),
            }));
        }
    }, [config.address, surveyType, surveyTypeFetched, surveyData, surveyDataFetched, setConfig]);

    return (
        <SurveyCreationContext.Provider value={{ config, setSurveyAddress, resetSurveyConfig }}>
            {children}
        </SurveyCreationContext.Provider>
    );
};

export const useSurveyCreation = () => {
    const context = useContext(SurveyCreationContext);
    if (!context) {
        throw new Error('useSurveyCreation must be used within a SurveyCreationProvider');
    }
    return context;
};
