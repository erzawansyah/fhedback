import { useCallback, useEffect, useMemo } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import useSyncedState from "@/hooks/useSyncedState";
import {
  QUESTIONNAIRE_ABIS,
  QUESTIONNAIRE_FACTORY_ADDRESS,
} from "@/lib/contracts";
import { SurveyCreationConfig, SurveyStatus } from "@/types/survey-creation";

interface useSetSurveyConfigProps {
  isEnabled: boolean;
  onError: (error: {
    message: string;
    name?: string;
    severity: "error" | "warning" | "info";
  }) => void;
}

const questionnaireStatus: SurveyStatus[] = [
  "initialized",
  "draft",
  "published",
  "closed",
  "trashed",
];

// Helper function to validate and convert blockchain data
const safeConvertData = {
  toString: (data: unknown, fallback: string = ""): string => {
    return data != null && data.toString().length > 0 ? String(data) : fallback;
  },
  toNumber: (data: unknown, fallback: number = 0): number => {
    const num = Number(data);
    return !isNaN(num) && isFinite(num) ? num : fallback;
  },
  toBoolean: (data: unknown, fallback: boolean = false): boolean => {
    return data === 1 || data === "1" || data === true ? true : fallback;
  },
};

export const useSetSurveyConfig = ({
  isEnabled,
  onError,
}: useSetSurveyConfigProps) => {
  // Internal state management
  const [config, setConfig] = useSyncedState<SurveyCreationConfig | null>(
    "survey_creation.config",
    null
  );

  // Helper function to update config
  const updateConfig = useCallback(
    (newConfig: Partial<SurveyCreationConfig>) => {
      setConfig((prev) => ({
        ...prev,
        ...newConfig,
        address: prev?.address ?? null, // Preserve address
      }));
    },
    [setConfig]
  );

  // Function to set survey address
  const setSurveyAddress = useCallback(
    (address: Address | null) => {
      if (!address) {
        throw new Error("Survey address cannot be null or empty");
      }
      setConfig((prev) => ({
        ...prev,
        address: address,
      }));
    },
    [setConfig]
  );

  // Function to reset config
  const resetConfig = useCallback(() => {
    setConfig(null);
  }, [setConfig]);

  const abis = QUESTIONNAIRE_ABIS;
  const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS;

  // Memoized contract configurations
  const contractConfigs = useMemo(() => {
    const factoryContract = {
      address: factoryAddress as Address,
      abi: abis.factory,
    } as const;

    const generalSurveyContract = config?.address
      ? ({
          address: config.address as Address,
          abi: abis.general,
        } as const)
      : null;

    return { factoryContract, generalSurveyContract };
  }, [config?.address, abis.factory, abis.general, factoryAddress]);

  // useReadContracts to fetch survey configuration
  const {
    data: surveyConfig,
    isSuccess: surveyConfigFetched,
    isLoading: surveyConfigLoading,
    error: surveyConfigError,
    refetch: refetchSurveyConfig,
  } = useReadContracts({
    contracts: contractConfigs.generalSurveyContract
      ? [
          {
            ...contractConfigs.generalSurveyContract,
            functionName: "title",
            args: [],
          },
          {
            ...contractConfigs.generalSurveyContract,
            functionName: "scaleLimit",
            args: [],
          },
          {
            ...contractConfigs.generalSurveyContract,
            functionName: "questionLimit",
            args: [],
          },
          {
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
          },
        ]
      : [],
    query: {
      enabled:
        isEnabled &&
        !!config?.address &&
        !!contractConfigs.generalSurveyContract,
      retry: 2,
      retryDelay: 1000,
      refetchOnMount: true,
      staleTime: 0, // Always consider data stale to force refetch
    },
  });

  // Handle survey configuration updates
  useEffect(() => {
    if (surveyConfigError) {
      onError({
        message: `Failed to fetch survey config: ${surveyConfigError.message}`,
        name: surveyConfigError.name,
        severity: "error",
      });
      return;
    }

    if (isEnabled && config?.address && surveyConfigFetched && surveyConfig) {
      try {
        const configResult = surveyConfig;

        // Check for individual contract call failures
        for (let i = 0; i < configResult.length; i++) {
          if (configResult[i].status === "failure" && configResult[i].error) {
            onError({
              message: `Config fetch error at index ${i}: ${
                configResult[i].error?.message ?? "Unknown error"
              }`,
              name: configResult[i].error?.name,
              severity: "warning",
            });
          }
        }

        const [
          title,
          limitScale,
          totalQuestions,
          respondentLimit,
          status,
          type,
        ] = configResult;

        updateConfig({
          title:
            title && title.status === "success"
              ? safeConvertData.toString(title.result)
              : "",
          limitScale:
            limitScale && limitScale.status === "success"
              ? safeConvertData.toNumber(limitScale.result)
              : 0,
          totalQuestions:
            totalQuestions && totalQuestions.status === "success"
              ? safeConvertData.toNumber(totalQuestions.result)
              : 0,
          respondentLimit:
            respondentLimit && respondentLimit.status === "success"
              ? safeConvertData.toNumber(respondentLimit.result)
              : 0,
          status:
            status &&
            status.status === "success" &&
            safeConvertData.toNumber(status.result) < questionnaireStatus.length
              ? (questionnaireStatus[
                  safeConvertData.toNumber(status.result)
                ] as SurveyStatus)
              : "initialized",
          encrypted:
            type && type.status === "success"
              ? safeConvertData.toBoolean(type.result)
              : false,
        });
      } catch (error) {
        onError({
          message: `Error processing survey config: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          severity: "error",
        });
      }
    }
  }, [
    surveyConfigFetched,
    surveyConfig,
    surveyConfigError,
    updateConfig,
    onError,
    isEnabled,
    config?.address,
  ]);

  // Function to manually refresh survey config
  const refreshStep1 = useCallback(() => {
    if (isEnabled && config?.address && contractConfigs.generalSurveyContract) {
      refetchSurveyConfig();
    }
  }, [
    isEnabled,
    config?.address,
    contractConfigs.generalSurveyContract,
    refetchSurveyConfig,
  ]);

  return {
    // State
    config,

    // State management methods
    setConfig,
    updateConfig,
    setSurveyAddress,
    resetConfig,

    // Original functionality
    isLoading: surveyConfigLoading,
    error: surveyConfigError,
    data: surveyConfig,
    refreshStep1,
    contractConfigs,
  };
};
