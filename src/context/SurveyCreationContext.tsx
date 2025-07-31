"use client";
import useSyncedState from '@/hooks/useSyncedState';
import { SurveyCreationConfig, SurveyCreationMetadata, SurveyCreationQuestions, SurveyCreationStep } from '@/types/survey-creation';
import { useSetSurveyConfig, useSetSurveyMetadata, useSetSurveyQuestions } from '@/hooks/survey-steps';

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Address } from 'viem';

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
    refreshSurveyStatus: () => void;
    refreshAllSteps: () => void;
}

interface SurveyCreationError {
    id: string; // Unique identifier for each error
    message: string;
    name?: string;
    code?: string;
    timestamp: number; // For error expiration
    severity: 'error' | 'warning' | 'info';
}

const SurveyCreationContext = createContext<SurveyCreationContextType | undefined>(undefined);

const defaultStep: SurveyCreationStep = {
    step1: false,
    step2: false,
    step3: false,
};

// Error auto-cleanup timeout (5 minutes)
const ERROR_CLEANUP_TIMEOUT = 5 * 60 * 1000;

export const SurveyCreationProvider = ({ children }: { children: ReactNode }) => {
    // Refs for cleanup and preventing memory leaks
    const mountedRef = useRef(true);
    const errorTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // State management
    const [refreshed, setRefreshed] = useState(false);
    const [errors, setErrors] = useState<SurveyCreationError[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Synced state with localStorage
    const [steps, setSteps, removeSteps] = useSyncedState<SurveyCreationStep>("survey_creation.steps", defaultStep);

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

    // Use hooks that now manage their own state
    const configHook = useSetSurveyConfig({
        isEnabled: steps.step1,
        onError: addError
    });

    const metadataHook = useSetSurveyMetadata({
        config: configHook.config,
        isEnabled: steps.step1, // Step2 enabled when step1 is complete
        contractConfigs: configHook.contractConfigs,
        onError: addError
    });

    const questionsHook = useSetSurveyQuestions({
        config: configHook.config,
        isEnabled: steps.step3,
        contractConfigs: configHook.contractConfigs,
        onError: addError
    });

    // Extract state and methods for easier access
    const { config, setSurveyAddress: setSurveyAddressFromHook, resetConfig } = configHook;
    const { metadata, resetMetadata } = metadataHook;
    const { questions, resetQuestions } = questionsHook;

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

        // Reset all survey data to null/default using hooks
        resetConfig();
        resetMetadata();
        resetQuestions();

        // Reset errors
        resetErrors();

        // Clear error timeouts
        errorTimeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
        errorTimeoutRefs.current.clear();
    }, [setSteps, removeSteps, resetConfig, resetMetadata, resetQuestions, resetErrors]);

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

        try {
            setSurveyAddressFromHook(address);
            setSteps(prev => ({ ...prev, step1: true }));
        } catch (error) {
            addError({
                message: error instanceof Error ? error.message : "Failed to set survey address",
                severity: 'error'
            });
        }
    }, [setSurveyAddressFromHook, setSteps, addError]);

    // Function to set metadata CID and update steps
    const setMetadataCid = useCallback(() => {
        setSteps(prev => ({ ...prev, step2: true }));
    }, [setSteps]);

    // Function to set questions status and update steps
    const setQuestionsStatus = useCallback(() => {
        setSteps(prev => ({ ...prev, step3: true }));
    }, [setSteps]);

    // Update loading state based on all hooks
    useEffect(() => {
        setIsLoading(configHook.isLoading || metadataHook.isLoading || questionsHook.isLoading);
    }, [configHook.isLoading, metadataHook.isLoading, questionsHook.isLoading]);

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

    // Manual refresh functions
    const refreshSurveyStatus = useCallback(() => {
        configHook.refreshStep1();
    }, [configHook]);

    const refreshAllSteps = useCallback(() => {
        configHook.refreshStep1();
        metadataHook.refreshStep2();
        questionsHook.refreshStep3();
    }, [configHook, metadataHook, questionsHook]);

    // Cleanup on unmount
    useEffect(() => {
        // Capture current ref values to use in cleanup
        const errorTimeouts = errorTimeoutRefs.current;

        return () => {
            mountedRef.current = false;

            // Clear all error timeouts using captured reference
            errorTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
            errorTimeouts.clear();
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
        refresh,
        refreshSurveyStatus,
        refreshAllSteps
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
        refresh,
        refreshSurveyStatus,
        refreshAllSteps
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
