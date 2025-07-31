import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import {
  QUESTIONNAIRE_ABIS,
  QUESTIONNAIRE_FACTORY_ADDRESS,
} from "@/lib/contracts";
import { safeConvertData } from "@/lib/utils/safeConvertData";
import { SurveyCreationConfig, SurveyStatus } from "@/types/survey-creation";

interface useSetSurveyConfigProps {
  isEnabled: boolean;
  address: Address | null;
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

export const useSetSurveyConfig = ({
  isEnabled,
  address,
  onError,
}: useSetSurveyConfigProps) => {
  // Internal state management - no localStorage, direct from contract
  const [config, setConfig] = useState<SurveyCreationConfig | null>(null);

  // Helper function to update config
  const updateConfig = useCallback(
    (newConfig: Partial<SurveyCreationConfig>) => {
      setConfig((prev: SurveyCreationConfig | null) => ({
        ...prev,
        ...newConfig,
      }));
    },
    []
  );

  // Function to reset config
  const resetConfig = useCallback(() => {
    setConfig(null);
  }, []);

  const abis = QUESTIONNAIRE_ABIS;
  const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS;

  // Memoized contract configurations based on external address prop
  const contractConfigs = useMemo(() => {
    const factoryContract = {
      address: factoryAddress as Address,
      abi: abis.factory,
    } as const;
    const generalSurveyContract = address
      ? ({ address, abi: abis.general } as const)
      : null;
    return { factoryContract, generalSurveyContract };
  }, [address, abis.factory, abis.general, factoryAddress]);

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
            args: [address as Address],
          },
        ]
      : [],
    query: {
      enabled:
        isEnabled && !!address && !!contractConfigs.generalSurveyContract,
      retry: 2,
      retryDelay: 1000,
      refetchOnMount: true,
      staleTime: 0, // Always consider data stale to force refetch
    },
  });

  // Clear config when address changes or is null
  useEffect(() => {
    if (!address) {
      setConfig(null);
    }
  }, [address]);

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

    if (isEnabled && address && surveyConfigFetched && surveyConfig) {
      try {
        const configResult = surveyConfig;

        // Check for individual contract call failures
        for (let i = 0; i < configResult.length; i++) {
          console.log(`Config fetch result at index ${i}:`, configResult[i]);

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

        console.log("Survey Status", status);

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
    address,
  ]);

  // Function to manually refresh survey config
  const refreshStep1 = useCallback(() => {
    if (isEnabled && address && contractConfigs.generalSurveyContract) {
      refetchSurveyConfig();
    }
  }, [
    isEnabled,
    address,
    contractConfigs.generalSurveyContract,
    refetchSurveyConfig,
  ]);

  return {
    // State
    config,

    // State management methods
    setConfig,
    updateConfig,
    resetConfig,

    // Original functionality
    isLoading: surveyConfigLoading,
    error: surveyConfigError,
    data: surveyConfig,
    refreshStep1,
    contractConfigs,
  };
};
