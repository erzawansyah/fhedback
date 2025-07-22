"use client";
import useSyncedState from '@/hooks/use-synced-state';
import { QUESTIONNAIRE_ABIS, QUESTIONNAIRE_FACTORY_ADDRESS } from '@/lib/contracts';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
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
    metadataCid: string | null;
}


interface SurveyMetadata {
    title: string;
    description: string;
    categories: string;
    minLabel: string;
    maxLabel: string;
    tags: string[];
}

interface SurveyCreationContextType {
    config: SurveyConfig;
    setSurveyAddress: (address: Address | null) => void;
    resetSurveyConfig: () => void;
    metadata: SurveyMetadata | null;
    refresh: () => void;
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
    metadataCid: null,
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
    const [refreshed, setRefreshed] = useState(false);
    // Initialize state from localStorage or default config
    const [config, setConfig, removeConfig] = useSyncedState<SurveyConfig>("surveyConfig", defaultSurveyConfig);
    const [metadata, setMetadata, removeMetadata] = useSyncedState<SurveyMetadata | null>("surveyMetadata", null);


    const factoryContract = {
        address: factoryAddress as Address,
        abi: abis.factory,
    } as const;

    const surveyContract = {
        address: config.address as Address | undefined,
        abi: abis.general,
    } as const;

    const { data: surveyType, isSuccess: surveyTypeFetched } = useReadContract({
        ...factoryContract,
        functionName: "getQuestionnaireType",
        args: [config.address as Address],
    })

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
            },
        ]
    });

    const { data: metadataCid, isSuccess: metadataCidFetched } = useReadContract({
        ...surveyContract,
        functionName: "metadataCID",
        args: [],
    })


    const setSurveyAddress = React.useCallback((address: Address | null) => {
        setConfig(prev => ({ ...prev, address }));
    }, [setConfig]);

    const resetSurveyConfig = () => {
        setConfig(defaultSurveyConfig);
        removeConfig();
        removeMetadata();
    };

    const getMetadataContent = async (cid: string) => {
        try {
            const response = await fetch(`/api/metadata?cid=${cid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch metadata');
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Error fetching metadata: ${error}`);
        }
    }

    const refresh = () => {
        setRefreshed(true);
    };

    useEffect(() => {
        if (refreshed) {
            const address = config.address;
            setConfig(defaultSurveyConfig);
            setSurveyAddress(address);
            setRefreshed(false);
        }
    }, [refreshed, setConfig, setSurveyAddress, config.address]);

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

    // If metadata CID fetched, get the metadata and set it
    useEffect(() => {
        if (config.address && metadataCidFetched && metadataCid && metadataCid !== null && metadataCid !== "") {
            setConfig(prev => ({ ...prev, metadataCid: metadataCid as string }));
            getMetadataContent(metadataCid as string)
                .then((content) => {
                    setMetadata({
                        title: content.title || '',
                        description: content.description || '',
                        categories: content.categories || '',
                        minLabel: content.minLabel || '',
                        maxLabel: content.maxLabel || '',
                        tags: Array.isArray(content.tags) ? content.tags : [],
                    });
                })
                .catch((error) => {
                    console.error('Error fetching metadata:', error);
                    setMetadata(null);
                });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadataCidFetched, metadataCid, setMetadata, config.address]);

    return (
        <SurveyCreationContext.Provider value={{
            config,
            setSurveyAddress,
            resetSurveyConfig,
            metadata,
            refresh
        }}>
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
