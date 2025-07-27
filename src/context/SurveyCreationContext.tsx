"use client";
import useSyncedState from '@/hooks/use-synced-state';
import { QUESTIONNAIRE_ABIS, QUESTIONNAIRE_FACTORY_ADDRESS } from '@/lib/contracts';
import { getMetadataContent } from '@/lib/utils/getMetadataContent';
import { SurveyCreationConfig, SurveyCreationMetadata, SurveyCreationQuestions, SurveyCreationStep, SurveyStatus } from '@/types/survey-creation';

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Address } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';

interface SurveyCreationContextType {
    config: SurveyCreationConfig | null;
    metadata: SurveyCreationMetadata | null;
    questions: SurveyCreationQuestions | null;
    setSurveyAddress: (address: Address | null) => void;
    setMetadataCid: () => void;
    setQuestionsStatus: () => void;
    steps: SurveyCreationStep;
    resetSteps: () => void;
    errors: SurveyCreationError[];
    resetErrors: () => void;
    clearError: (index: number) => void;
    isLoading: boolean;
    refreshed: boolean;
    refresh: () => void;
}

interface SurveyCreationError {
    id: string; // Unique identifier for each error
    message: string;
    name?: string;
    code?: string;
    timestamp: number; // For error expiration
    severity: 'error' | 'warning' | 'info';
}

// Helper function to validate blockchain data
const validateBlockchainData = (data: unknown, expectedType: 'string' | 'number' | 'boolean'): boolean => {
    switch (expectedType) {
        case 'string':
            return typeof data === 'string' || (data != null && data.toString().length > 0);
        case 'number':
            return !isNaN(Number(data)) && isFinite(Number(data));
        case 'boolean':
            return typeof data === 'boolean' || data === 0 || data === 1 || data === '0' || data === '1';
        default:
            return false;
    }
};

// Helper function to safely convert blockchain data
const safeConvertData = {
    toString: (data: unknown, fallback: string = ""): string => {
        return validateBlockchainData(data, 'string') ? String(data) : fallback;
    },
    toNumber: (data: unknown, fallback: number = 0): number => {
        return validateBlockchainData(data, 'number') ? Number(data) : fallback;
    },
    toBoolean: (data: unknown, fallback: boolean = false): boolean => {
        if (validateBlockchainData(data, 'boolean')) {
            return data === 1 || data === '1' || data === true;
        }
        return fallback;
    }
};

const SurveyCreationContext = createContext<SurveyCreationContextType | undefined>(undefined);

const defaultStep: SurveyCreationStep = {
    step1: false,
    step2: false,
    step3: false,
};

const abis = QUESTIONNAIRE_ABIS;
const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS;
const questionnaireStatus: SurveyStatus[] = [
    "initialized",
    "draft",
    "published",
    "closed",
    "trashed",
];

// Error auto-cleanup timeout (5 minutes)
const ERROR_CLEANUP_TIMEOUT = 5 * 60 * 1000;

export const SurveyCreationProvider = ({ children }: { children: ReactNode }) => {
    // Refs for cleanup and preventing memory leaks
    const mountedRef = useRef(true);
    const errorTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const abortControllerRef = useRef<AbortController | null>(null);

    // State management
    const [refreshed, setRefreshed] = useState(false);
    const [errors, setErrors] = useState<SurveyCreationError[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Synced state with localStorage
    const [steps, setSteps, removeSteps] = useSyncedState<SurveyCreationStep>("survey_creation.steps", defaultStep);
    const [config, setConfig] = useSyncedState<SurveyCreationConfig | null>("survey_creation.config", null);
    const [metadata, setMetadata] = useSyncedState<SurveyCreationMetadata | null>("survey_creation.metadata", null);
    const [questions, setQuestions] = useSyncedState<SurveyCreationQuestions | null>("survey_creation.questions", null);

    // Memoized contract configurations
    const contractConfigs = useMemo(() => {
        const factoryContract = {
            address: factoryAddress as Address,
            abi: abis.factory,
        } as const;

        const generalSurveyContract = config?.address ? {
            address: config.address as Address,
            abi: abis.general,
        } as const : null;

        return { factoryContract, generalSurveyContract };
    }, [config?.address]);

    // Stable callback functions with proper dependencies
    const addError = useCallback((error: Omit<SurveyCreationError, 'id' | 'timestamp'>) => {
        if (!mountedRef.current) return;

        const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newError: SurveyCreationError = {
            ...error,
            id: errorId,
            timestamp: Date.now(),
            severity: error.severity || 'error'
        };

        setErrors(prev => {
            // Prevent duplicate errors
            const isDuplicate = prev.some(e =>
                e.message === newError.message &&
                e.name === newError.name &&
                (Date.now() - e.timestamp) < 1000 // Within 1 second
            );

            if (isDuplicate) return prev;

            // Limit to maximum 10 errors
            const updatedErrors = [...prev, newError];
            return updatedErrors.slice(-10);
        });

        // Auto-cleanup error after timeout
        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                setErrors(prev => prev.filter(e => e.id !== errorId));
                errorTimeoutRefs.current.delete(errorId);
            }
        }, ERROR_CLEANUP_TIMEOUT);

        errorTimeoutRefs.current.set(errorId, timeoutId);
    }, []);

    const clearError = useCallback((index: number) => {
        setErrors(prev => {
            const errorToRemove = prev[index];
            if (errorToRemove) {
                const timeoutId = errorTimeoutRefs.current.get(errorToRemove.id);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    errorTimeoutRefs.current.delete(errorToRemove.id);
                }
            }
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const resetErrors = useCallback(() => {
        // Clear all timeout refs
        errorTimeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
        errorTimeoutRefs.current.clear();
        setErrors([]);
    }, []);

    const resetSteps = useCallback(() => {
        // Reset steps
        setSteps(defaultStep);
        removeSteps();

        // Reset all survey data to null/default
        setConfig(null);
        setMetadata(null);
        setQuestions(null);

        // Reset errors
        resetErrors();

        // Cancel any pending async operations
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Clear error timeouts
        errorTimeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
        errorTimeoutRefs.current.clear();
    }, [setSteps, removeSteps, setConfig, setMetadata, setQuestions, resetErrors]);

    // function to refresh any survey data
    const refresh = useCallback(() => {
        setRefreshed(true);
    }, []);

    // Function to set survey address and update steps
    const setSurveyAddress = useCallback((address: Address | null) => {
        if (!address) {
            addError({
                message: "Survey address cannot be null or empty",
                severity: 'error'
            });
            return;
        }

        setConfig(prev => ({
            ...prev,
            address: address
        }));
        setSteps(prev => ({ ...prev, step1: true }));
    }, [setConfig, setSteps, addError]);

    // Function to set metadata CID and update steps
    const setMetadataCid = useCallback(() => {
        setSteps(prev => ({ ...prev, step2: true }));
    }, [setSteps]);

    // Function to set questions status and update steps
    const setQuestionsStatus = useCallback(() => {
        setSteps(prev => ({ ...prev, step3: true }));
    }, [setSteps]);

    // useReadContracts to fetch survey configuration
    const {
        data: surveyConfig,
        isSuccess: surveyConfigFetched,
        isLoading: surveyConfigLoading,
        error: surveyConfigError
    } = useReadContracts({
        contracts: contractConfigs.generalSurveyContract ? [
            {
                ...contractConfigs.generalSurveyContract,
                functionName: "title",
                args: [],
            }, {
                ...contractConfigs.generalSurveyContract,
                functionName: "scaleLimit",
                args: [],
            },
            {
                ...contractConfigs.generalSurveyContract,
                functionName: "questionLimit",
                args: [],
            }, {
                ...contractConfigs.generalSurveyContract,
                functionName: "respondentLimit",
                args: [],
            },
            {
                ...contractConfigs.generalSurveyContract,
                functionName: "status",
                args: [],
            },
            {
                ...contractConfigs.factoryContract,
                functionName: "getQuestionnaireType",
                args: [config?.address as Address],
            }
        ] : [],
        query: {
            enabled: steps.step1 && !!config?.address && !!contractConfigs.generalSurveyContract,
            retry: 2,
            retryDelay: 1000,
        }
    });

    // useReadContract to fetch metadata CID
    const {
        data: surveyMetadataCid,
        isSuccess: surveyMetadataCidFetched,
        isLoading: surveyMetadataLoading,
        error: surveyMetadataCidError,
    } = useReadContract({
        ...contractConfigs.generalSurveyContract!,
        functionName: "metadataCID",
        args: [],
        query: {
            enabled: steps.step1 && !!config?.address && !!contractConfigs.generalSurveyContract,
            retry: 2,
            retryDelay: 1000,
        }
    });

    // useReadContract to fetch questions
    const {
        data: questionsData,
        isSuccess: questionsFetched,
        isLoading: questionsLoading,
        error: questionsError,
    } = useReadContract({
        ...contractConfigs.generalSurveyContract!,
        functionName: "getAllQuestions",
        args: [],
        query: {
            enabled: steps.step3 && !!config?.address && !!contractConfigs.generalSurveyContract,
            retry: 2,
            retryDelay: 1000,
        }
    });

    // Update loading state based on contract fetch states
    useEffect(() => {
        setIsLoading(surveyConfigLoading || surveyMetadataLoading || questionsLoading);
    }, [surveyConfigLoading, surveyMetadataLoading, questionsLoading]);

    // Handle survey configuration updates with proper error handling
    useEffect(() => {
        if (!mountedRef.current) return;

        if (surveyConfigError) {
            addError({
                message: `Failed to fetch survey config: ${surveyConfigError.message}`,
                name: surveyConfigError.name,
                severity: 'error'
            });
            return;
        }

        if (steps.step1 && !!config?.address && surveyConfigFetched && surveyConfig) {
            try {
                const configResult = surveyConfig;

                // Check for individual contract call failures
                for (let i = 0; i < configResult.length; i++) {
                    if (configResult[i].status === "failure" && configResult[i].error) {
                        addError({
                            message: `Config fetch error at index ${i}: ${configResult[i].error?.message ?? 'Unknown error'}`,
                            name: configResult[i].error?.name,
                            severity: 'warning'
                        });
                    }
                }

                const [title, limitScale, totalQuestions, respondentLimit, status, type] = configResult;

                setConfig(prev => ({
                    ...prev,
                    title: title && title.status === "success" ? safeConvertData.toString(title.result) : "",
                    limitScale: limitScale && limitScale.status === "success" ? safeConvertData.toNumber(limitScale.result) : 0,
                    totalQuestions: totalQuestions && totalQuestions.status === "success" ? safeConvertData.toNumber(totalQuestions.result) : 0,
                    respondentLimit: respondentLimit && respondentLimit.status === "success" ? safeConvertData.toNumber(respondentLimit.result) : 0,
                    status: status && status.status === "success" && safeConvertData.toNumber(status.result) < questionnaireStatus.length
                        ? questionnaireStatus[safeConvertData.toNumber(status.result)] as SurveyStatus
                        : "initialized",
                    encrypted: type && type.status === "success" ? safeConvertData.toBoolean(type.result) : false,
                    address: prev?.address ?? null,
                }));
            } catch (error) {
                addError({
                    message: `Error processing survey config: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error'
                });
            }
        }
    }, [surveyConfigFetched, surveyConfig, surveyConfigError, setConfig, addError, steps.step1, config?.address]);

    // Handle metadata CID updates with abort controller for cleanup
    useEffect(() => {
        if (!mountedRef.current) return;

        if (surveyMetadataCidError) {
            addError({
                message: `Failed to fetch metadata CID: ${surveyMetadataCidError.message}`,
                name: surveyMetadataCidError.name,
                severity: 'error'
            });
            return;
        }

        if (surveyMetadataCidFetched && surveyMetadataCid) {
            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();
            const currentCid = metadata?.metadataCid;
            const newCid = surveyMetadataCid as string;

            if (currentCid !== newCid) {
                setMetadata(null)
            }
            // debug time for metadata fetching
            const startTime = Date.now();
            console.log(`Fetching metadata content for CID: ${newCid}. Start: ${startTime}ms`);
            getMetadataContent(newCid)
                .then(data => {
                    // Check if component is still mounted and CID hasn't changed
                    if (mountedRef.current && newCid === surveyMetadataCid) {
                        setMetadata(prev => ({
                            ...prev,
                            title: safeConvertData.toString(data.title),
                            description: safeConvertData.toString(data.description),
                            categories: safeConvertData.toString(data.categories),
                            minLabel: safeConvertData.toString(data.minLabel),
                            maxLabel: safeConvertData.toString(data.maxLabel),
                            tags: Array.isArray(data.tags) ? data.tags : [],
                            metadataCid: newCid, // Set the CID that was fetched
                        }));
                    }
                    const endTime = Date.now();
                    console.log(`Metadata fetching took ${endTime - startTime}ms`);
                })
                .catch(error => {
                    // Only add error if not aborted and component is mounted
                    if (mountedRef.current && error.name !== 'AbortError') {
                        addError({
                            message: `Failed to fetch metadata content: ${error.message}`,
                            name: error.name,
                            code: error.code,
                            severity: 'error'
                        });
                    }
                });
        }

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [metadata?.metadataCid, metadata?.title, surveyMetadataCidFetched, surveyMetadataCid, surveyMetadataCidError, setMetadata, addError]);

    // Handle questions updates with proper validation
    useEffect(() => {
        if (!mountedRef.current) return;

        if (questionsError) {
            addError({
                message: `Failed to fetch questions: ${questionsError.message}`,
                name: questionsError.name,
                severity: 'error'
            });
            return;
        }

        if (steps.step3 && questionsFetched && questionsData) {
            try {
                if (Array.isArray(questionsData) && questionsData.length > 0) {
                    console.log("Processing questions data:", questionsData);
                    // Validate questions data structure
                    const validQuestions = questionsData.filter(q =>
                        q && typeof q === 'string' &&
                        safeConvertData.toString(q.toString()).length > 0
                    );
                    console.log("Valid questions found:", validQuestions);

                    if (validQuestions.length > 0) {
                        setQuestions(validQuestions);
                    } else {
                        addError({
                            message: "No valid questions found in the data",
                            severity: 'warning'
                        });
                    }
                } else if (Array.isArray(questionsData) && questionsData.length === 0) {
                    setQuestions([]);
                    addError({
                        message: "No questions found for this survey",
                        severity: 'info'
                    });
                } else {
                    addError({
                        message: "Invalid questions data format received from contract",
                        severity: 'error'
                    });
                }
            } catch (error) {
                addError({
                    message: `Error processing questions data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error'
                });
            }
        }
    }, [steps.step3, questionsFetched, questionsData, questionsError, setQuestions, addError]);


    // Effect to handle refreshed state
    useEffect(() => {
        if (refreshed) {
            // Save necessary state before resetting
            const currentSteps = steps;
            const currentAddress: Address | null | undefined = config?.address;
            const currentMetadataCid: string | null | undefined = metadata?.metadataCid;
            setIsLoading(true);
            resetSteps();
            if (currentSteps.step1 && currentAddress) {
                setSurveyAddress(currentAddress);
            }
            if (currentSteps.step2 && currentMetadataCid) {
                setMetadataCid();
            }
            if (currentSteps.step3) {
                setQuestionsStatus();
            }
            setTimeout(() => {
                setRefreshed(false);
                setIsLoading(false);
            }, 1000); // Simulate refresh delay
        }
    }, [refreshed, steps, config?.address, metadata?.metadataCid, resetSteps, setSurveyAddress, setMetadataCid, setQuestionsStatus]);

    // Cleanup on unmount
    useEffect(() => {
        // Capture current ref values to use in cleanup
        const errorTimeouts = errorTimeoutRefs.current;
        const abortController = abortControllerRef.current;

        return () => {
            mountedRef.current = false;

            // Clear all error timeouts using captured reference
            errorTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            errorTimeouts.clear();

            // Abort any pending requests using captured reference
            if (abortController) {
                abortController.abort();
            }
        };
    }, []);

    const contextValue = useMemo(() => ({
        config,
        metadata,
        questions,
        setSurveyAddress,
        setMetadataCid,
        setQuestionsStatus,
        errors,
        resetErrors,
        clearError,
        steps,
        resetSteps,
        isLoading,
        refreshed,
        refresh
    }), [
        config,
        metadata,
        questions,
        setSurveyAddress,
        setMetadataCid,
        setQuestionsStatus,
        errors,
        resetErrors,
        clearError,
        steps,
        resetSteps,
        isLoading,
        refreshed,
        refresh
    ]);

    return (
        <SurveyCreationContext.Provider value={contextValue}>
            {children}
        </SurveyCreationContext.Provider>
    );
};

export const useSurveyCreationContext = () => {
    const context = useContext(SurveyCreationContext);
    if (!context) {
        throw new Error('useSurveyCreationContext must be used within a SurveyCreationProvider');
    }
    return context;
};
