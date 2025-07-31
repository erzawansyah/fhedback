import { useCallback, useEffect, useRef } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import useSyncedState from "@/hooks/useSyncedState";
import { getMetadataContent } from "@/lib/utils/getMetadataContent";
import {
  SurveyCreationConfig,
  SurveyCreationMetadata,
} from "@/types/survey-creation";

interface useSetSurveyMetadataProps {
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
    code?: string;
    severity: "error" | "warning" | "info";
  }) => void;
}

// Helper function to safely convert data
const safeConvertData = {
  toString: (data: unknown, fallback: string = ""): string => {
    return data != null && data.toString().length > 0 ? String(data) : fallback;
  },
};

export const useSetSurveyMetadata = ({
  config,
  isEnabled,
  contractConfigs,
  onError,
}: useSetSurveyMetadataProps) => {
  // Internal state management
  const [metadata, setMetadata] = useSyncedState<SurveyCreationMetadata | null>(
    "survey_creation.metadata",
    null
  );

  // Helper function to update metadata
  const updateMetadata = useCallback(
    (newMetadata: Partial<SurveyCreationMetadata>) => {
      setMetadata((prev) => {
        if (!prev) {
          // If prev is null, create a new object with default values
          return {
            metadataCid: newMetadata.metadataCid || null,
            title: newMetadata.title || "",
            description: newMetadata.description || "",
            categories: newMetadata.categories || "",
            minLabel: newMetadata.minLabel || "",
            maxLabel: newMetadata.maxLabel || "",
            tags: newMetadata.tags || [],
          };
        }
        return {
          ...prev,
          ...newMetadata,
        };
      });
    },
    [setMetadata]
  );

  // Function to reset metadata
  const resetMetadata = useCallback(() => {
    setMetadata(null);
  }, [setMetadata]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // useReadContract to fetch metadata CID
  const {
    data: surveyMetadataCid,
    isSuccess: surveyMetadataCidFetched,
    isLoading: surveyMetadataLoading,
    error: surveyMetadataCidError,
    refetch: refetchMetadataCid,
  } = useReadContract({
    ...contractConfigs.generalSurveyContract!,
    functionName: "metadataCID",
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

  // Handle metadata CID updates with abort controller for cleanup
  useEffect(() => {
    if (!mountedRef.current) return;

    if (surveyMetadataCidError) {
      onError({
        message: `Failed to fetch metadata CID: ${surveyMetadataCidError.message}`,
        name: surveyMetadataCidError.name,
        severity: "error",
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
        updateMetadata({ metadataCid: null });
      }

      // Fetch metadata content
      getMetadataContent(newCid)
        .then((data) => {
          // Check if component is still mounted and CID hasn't changed
          if (mountedRef.current && newCid === surveyMetadataCid) {
            updateMetadata({
              title: safeConvertData.toString(data.title),
              description: safeConvertData.toString(data.description),
              categories: safeConvertData.toString(data.categories),
              minLabel: safeConvertData.toString(data.minLabel),
              maxLabel: safeConvertData.toString(data.maxLabel),
              tags: Array.isArray(data.tags) ? data.tags : [],
              metadataCid: newCid, // Set the CID that was fetched
            });
          }
        })
        .catch((error) => {
          // Only add error if not aborted and component is mounted
          if (mountedRef.current && error.name !== "AbortError") {
            onError({
              message: `Failed to fetch metadata content: ${error.message}`,
              name: error.name,
              code: error.code,
              severity: "error",
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
  }, [
    metadata?.metadataCid,
    surveyMetadataCidFetched,
    surveyMetadataCid,
    surveyMetadataCidError,
    updateMetadata,
    onError,
  ]);

  // Function to manually refresh metadata
  const refreshStep2 = useCallback(() => {
    if (isEnabled && config?.address && contractConfigs.generalSurveyContract) {
      refetchMetadataCid();
    }
  }, [
    isEnabled,
    config?.address,
    contractConfigs.generalSurveyContract,
    refetchMetadataCid,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    const abortController = abortControllerRef.current;

    return () => {
      mountedRef.current = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    // State
    metadata,

    // State management methods
    setMetadata,
    updateMetadata,
    resetMetadata,

    // Original functionality
    isLoading: surveyMetadataLoading,
    error: surveyMetadataCidError,
    data: surveyMetadataCid,
    refreshStep2,
  };
};
