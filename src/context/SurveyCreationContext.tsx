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
    questionsAdded: boolean;
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
    questions: string[];
    setQuestions: (questions: string[]) => void;
    refresh: () => void;
    refreshed?: boolean;
    handleQuestionsAdded: () => void;
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
    questionsAdded: false,
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
    // State to track if refresh has been triggered
    const [refreshed, setRefreshed] = useState(false);

    // Initialize state from localStorage or default config
    // useSyncedState automatically syncs with localStorage for persistence
    const [config, setConfig, removeConfig] = useSyncedState<SurveyConfig>("surveyConfig", defaultSurveyConfig);
    const [metadata, setMetadata, removeMetadata] = useSyncedState<SurveyMetadata | null>("surveyMetadata", null);
    const [questions, setQuestions] = useSyncedState<string[]>("surveyQuestions", []);

    // Contract configurations for blockchain interactions
    const factoryContract = {
        address: factoryAddress as Address,
        abi: abis.factory,
    } as const;

    const generalSurveyContract = {
        address: config.address as Address | undefined,
        abi: abis.general,
    } as const;

    // Wagmi hooks to fetch survey type from factory contract
    const { data: surveyType, isSuccess: surveyTypeFetched } = useReadContract({
        ...factoryContract,
        functionName: "getQuestionnaireType",
        args: [config.address as Address],
        query: {
            enabled: !!config.address, // Only fetch when address is available
        }
    })

    // Wagmi hooks to fetch multiple survey data from survey contract
    const { data: surveyData, isSuccess: surveyDataFetched } = useReadContracts({
        contracts: [
            {
                ...generalSurveyContract,
                functionName: "title",
                args: [],
            }, {
                ...generalSurveyContract,
                functionName: "scaleLimit",
                args: [],
            },
            {
                ...generalSurveyContract,
                functionName: "questionLimit",
                args: [],
            }, {
                ...generalSurveyContract,
                functionName: "respondentLimit",
                args: [],
            },
            {
                ...generalSurveyContract,
                functionName: "status",
                args: [],
            }
        ],
        query: {
            enabled: !!config.address, // Only fetch when address is available
        }
    });

    // Wagmi hook to fetch metadata CID from survey contract
    const { data: metadataCid, isSuccess: metadataCidFetched } = useReadContract({
        ...generalSurveyContract,
        functionName: "metadataCID",
        args: [],
        query: {
            enabled: !!config.address, // Only fetch when address is available
        }
    })

    // Wagmi hook to fetch quetions from survey contract
    const { data: questionsData, isSuccess: questionsFetched } = useReadContract({
        ...generalSurveyContract,
        functionName: "getQuestions",
        args: [],
        query: {
            enabled: !!config.address, // Only fetch when address is available
        }
    });


    // Function to set survey address and trigger data fetch
    const setSurveyAddress = React.useCallback((address: Address | null) => {
        setConfig(prev => ({ ...prev, address }));
    }, [setConfig]);

    /**
     * Function to handle questions added state
     * This will be used to track if questions have been added to the survey
     */
    const handleQuestionsAdded = React.useCallback(() => {
        setConfig(prev => ({ ...prev, questionsAdded: true }));
    }, [setConfig]);

    // Function to completely reset survey configuration and clear localStorage
    const resetSurveyConfig = React.useCallback(() => {
        setConfig(defaultSurveyConfig);
        removeConfig();
        removeMetadata();
        setQuestions([]);
    }, [setConfig, removeConfig, removeMetadata, setQuestions]);

    const getMetadataContent = async (cid: string) => {
        try {
            const response = await fetch(`/api/metadata?cid=${cid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching metadata:', error);
            throw new Error(`Error fetching metadata: ${error}`);
        }
    }

    /**
     * Function to refresh survey data by refetching from blockchain
     * This will reset config to default values while preserving the address,
     * triggering a fresh fetch of all survey data from smart contracts
     */
    const refresh = React.useCallback(() => {
        setRefreshed(true);
    }, []);



    /**
     * Effect to handle refresh logic
     * When refresh is triggered, this will:
     * 1. Preserve the current survey address
     * 2. Reset config to default values (triggers re-fetch)
     * 3. Restore the address to trigger blockchain data fetch
     * 4. Clear metadata and questions to force fresh fetch
     */
    useEffect(() => {
        if (refreshed) {
            const currentAddress = config.address;

            // Reset all configurations to default
            setConfig(defaultSurveyConfig);
            // Clear metadata and questions to force fresh fetch
            setMetadata(null);
            setQuestions([]);

            // Restore address to trigger fresh blockchain data fetch
            if (currentAddress) {
                setSurveyAddress(currentAddress);
            }

            // Reset refresh flag
            setRefreshed(false);
        }
    }, [refreshed, setConfig, setSurveyAddress, setMetadata, setQuestions, config.address]);

    // Effect to sync blockchain data with local config when survey data is fetched
    useEffect(() => {
        if (config.address && surveyTypeFetched && surveyDataFetched) {
            const [titleRes, scaleLimitRes, questionLimitRes, respondentLimitRes, statusRes] = surveyData || [];

            // Extract values with fallbacks for failed responses
            const title = titleRes?.status === 'success' ? titleRes.result : '';
            const scaleLimit = scaleLimitRes?.status === 'success' ? scaleLimitRes.result : 0;
            const questionLimit = questionLimitRes?.status === 'success' ? questionLimitRes.result : 0;
            const respondentLimit = respondentLimitRes?.status === 'success' ? respondentLimitRes.result : 0;
            const status = statusRes?.status === 'success' ? statusRes.result : null;

            // Update config with blockchain data, ensuring proper type conversion
            setConfig(prev => ({
                ...prev,
                title: typeof title === 'string' ? title : String(title ?? ''),
                status: typeof status === 'number' ? questionnaireStatus[status] : String(questionnaireStatus[Number(status)] ?? ''),
                limitScale: typeof scaleLimit === 'number' ? scaleLimit : Number(scaleLimit ?? 0),
                totalQuestions: typeof questionLimit === 'number' ? questionLimit : Number(questionLimit ?? 0),
                respondentLimit: typeof respondentLimit === 'number' ? respondentLimit : Number(respondentLimit ?? 0),
                // Set isFhe based on survey type from factory contract
                isFhe: surveyType === 1, // Assuming 1 = FHE type, 0 = General type
            }));
        }
    }, [config.address, surveyType, surveyTypeFetched, surveyData, surveyDataFetched, setConfig]);

    // Effect to fetch and update metadata when metadata CID is available
    useEffect(() => {
        if (config.address && metadataCidFetched && metadataCid && metadataCid !== null && metadataCid !== "") {
            // Update config with the metadata CID
            setConfig(prev => ({ ...prev, metadataCid: metadataCid as string }));

            // Fetch metadata content from IPFS/Pinata via API
            getMetadataContent(metadataCid as string)
                .then((content) => {
                    // Successfully fetched metadata, update state with proper fallbacks
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
                    // Failed to fetch metadata, log error and set metadata to null
                    console.error('Error fetching metadata:', error);
                    setMetadata(null);
                });
        }
        // Note: Intentionally excluding getMetadataContent and setMetadata from deps
        // to prevent unnecessary re-fetches when these functions change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadataCidFetched, metadataCid, config.address]);

    // Effect to update questions when fetched from contract
    useEffect(() => {
        if (config.address && questionsFetched && Array.isArray(questionsData) && questionsData.length > 0) {
            // Update questions state with fetched data from blockchain
            const fetchedQuestions = questionsData as string[];
            setQuestions(fetchedQuestions);

            // Update questionsAdded status based on whether questions exist
            const hasQuestions = fetchedQuestions.length > 0;
            setConfig(prev => ({ ...prev, questionsAdded: hasQuestions }));
        }
    }, [config.address, questionsFetched, questionsData, setQuestions, setConfig]);

    return (
        <SurveyCreationContext.Provider value={{
            config,
            setSurveyAddress,
            resetSurveyConfig,
            metadata,
            questions,
            setQuestions,
            refresh,
            refreshed,
            handleQuestionsAdded,
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
