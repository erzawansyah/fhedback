import { useCallback, useEffect } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import useSyncedState from "@/hooks/useSyncedState";
import {
  SurveyCreationConfig,
  SurveyCreationQuestions,
} from "@/types/survey-creation";

interface useSetSurveyQuestionsProps {
  config: SurveyCreationConfig | null;
  isEnabled: boolean;
  contractConfigs: {
    generalSurveyContract: {
      address: Address;
      abi: readonly unknown[];
    } | null;
  };
  onError: (error: {
    message: string;
    name?: string;
    severity: "error" | "warning" | "info";
  }) => void;
}

// Helper function to safely convert data
const safeConvertData = {
  toString: (data: unknown): string => {
    return data != null && data.toString().length > 0 ? String(data) : "";
  },
};

export const useSetSurveyQuestions = ({
  config,
  isEnabled,
  contractConfigs,
  onError,
}: useSetSurveyQuestionsProps) => {
  // Internal state management
  const [questions, setQuestions] =
    useSyncedState<SurveyCreationQuestions | null>(
      "survey_creation.questions",
      null
    );

  // Helper function to update questions
  const updateQuestions = useCallback(
    (newQuestions: SurveyCreationQuestions) => {
      setQuestions(newQuestions);
    },
    [setQuestions]
  );

  // Function to reset questions
  const resetQuestions = useCallback(() => {
    setQuestions(null);
  }, [setQuestions]);

  // useReadContract to fetch questions
  const {
    data: questionsData,
    isSuccess: questionsFetched,
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
  } = useReadContract({
    ...contractConfigs.generalSurveyContract!,
    functionName: "getAllQuestions",
    args: [],
    query: {
      enabled:
        isEnabled &&
        !!config?.address &&
        !!contractConfigs.generalSurveyContract,
      retry: 2,
      retryDelay: 1000,
      refetchOnMount: true,
      staleTime: 0,
    },
  });

  // Handle questions updates with proper validation
  useEffect(() => {
    if (questionsError) {
      onError({
        message: `Failed to fetch questions: ${questionsError.message}`,
        name: questionsError.name,
        severity: "error",
      });
      return;
    }

    if (isEnabled && questionsFetched && questionsData) {
      try {
        if (Array.isArray(questionsData) && questionsData.length > 0) {
          // Validate questions data structure
          const validQuestions = questionsData.filter(
            (q) =>
              q &&
              typeof q === "string" &&
              safeConvertData.toString(q.toString()).length > 0
          );

          if (validQuestions.length > 0) {
            updateQuestions(validQuestions);
          } else {
            onError({
              message: "No valid questions found in the data",
              severity: "warning",
            });
          }
        } else if (Array.isArray(questionsData) && questionsData.length === 0) {
          updateQuestions([]);
          onError({
            message: "No questions found for this survey",
            severity: "info",
          });
        } else {
          onError({
            message: "Invalid questions data format received from contract",
            severity: "error",
          });
        }
      } catch (error) {
        onError({
          message: `Error processing questions data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          severity: "error",
        });
      }
    }
  }, [
    isEnabled,
    questionsFetched,
    questionsData,
    questionsError,
    updateQuestions,
    onError,
  ]);

  // Function to manually refresh questions
  const refreshStep3 = useCallback(() => {
    if (isEnabled && config?.address && contractConfigs.generalSurveyContract) {
      refetchQuestions();
    }
  }, [
    isEnabled,
    config?.address,
    contractConfigs.generalSurveyContract,
    refetchQuestions,
  ]);

  return {
    // State
    questions,

    // State management methods
    setQuestions,
    updateQuestions,
    resetQuestions,

    // Original functionality
    isLoading: questionsLoading,
    error: questionsError,
    data: questionsData,
    refreshStep3,
  };
};
