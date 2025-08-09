import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { getMetadataContent } from "@/lib/utils/getMetadataContent";
import { safeConvertData } from "@/lib/utils/safeConvertData";
import { SurveyCreationMetadata } from "@/types/survey-creation";

interface useSetSurveyMetadataProps {
  address: Address | null;
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

export const useSetSurveyMetadata = ({
  address,
  isEnabled,
  contractConfigs,
  onError,
}: useSetSurveyMetadataProps) => {
  // Internal state management - no localStorage, direct from contract
  const [metadata, setMetadata] = useState<SurveyCreationMetadata | null>(null);

  // Helper function to update metadata
  const updateMetadata = useCallback(
    (newMetadata: Partial<SurveyCreationMetadata>) => {
      setMetadata((prev: SurveyCreationMetadata | null) => {
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
    []
  );

  // Function to reset metadata
  const resetMetadata = useCallback(() => {
    setMetadata(null);
  }, []);

  // Memoize contract availability to prevent unnecessary re-renders
  const hasValidContract = useMemo(() => {
    return !!(isEnabled && address && contractConfigs.generalSurveyContract);
  }, [isEnabled, address, contractConfigs.generalSurveyContract]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const processedCidRef = useRef<string | null>(null); // Track processed CID to prevent loops

  // Create stable references to prevent dependency loops
  const onErrorRef = useRef(onError);
  const contractConfigsRef = useRef(contractConfigs);

  // Update refs when props change
  useEffect(() => {
    onErrorRef.current = onError;
    contractConfigsRef.current = contractConfigs;
  });

  // Ensure mounted ref is set to true on mount
  useEffect(() => {
    mountedRef.current = true;
  }, []);

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
      enabled: hasValidContract,
      // retry: 1, // Reduce retry attempts
      // retryDelay: 2000, // Increase retry delay
      // refetchOnMount: false, // Don't refetch on mount to prevent spam
      // refetchOnWindowFocus: false, // Don't refetch on window focus
      // staleTime: 60000, // Cache for 1 minute
      // refetchInterval: false, // Disable automatic refetching
    },
  });

  // Clear metadata when address changes or is null
  useEffect(() => {
    if (!address) {
      setMetadata(null);
      processedCidRef.current = null; // Reset processed CID when address changes
    } else {
      // Reset processed CID when address changes to allow fetching for new address
      processedCidRef.current = null;
    }
  }, [address]);

  // Force refetch when enabled state changes (e.g., when navigating to a page)
  useEffect(() => {
    if (
      isEnabled &&
      address &&
      contractConfigsRef.current.generalSurveyContract
    ) {
      // Reset processed CID to allow fetching when component becomes enabled
      processedCidRef.current = null;
    }
  }, [isEnabled, address]);

  // Separate effect for metadata content fetching
  useEffect(() => {
    if (
      !mountedRef.current ||
      !isEnabled ||
      !address ||
      !contractConfigsRef.current.generalSurveyContract ||
      !surveyMetadataCidFetched ||
      !surveyMetadataCid ||
      typeof surveyMetadataCid !== "string" ||
      surveyMetadataCid.length === 0
    ) {
      return;
    }

    const newCid = surveyMetadataCid as string;
    const currentProcessedKey = `${address}-${newCid}`;

    // Skip if already processed
    if (processedCidRef.current === currentProcessedKey) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Mark as being processed
    processedCidRef.current = currentProcessedKey;

    // Set loading state
    setMetadata(
      (prev) => ({ ...prev, metadataCid: null } as SurveyCreationMetadata)
    );

    // Fetch with delay
    const timeoutId = setTimeout(() => {
      if (
        !mountedRef.current ||
        processedCidRef.current !== currentProcessedKey
      ) {
        return;
      }

      getMetadataContent(newCid)
        .then((data) => {
          if (
            mountedRef.current &&
            processedCidRef.current === currentProcessedKey
          ) {
            const newMetadata: SurveyCreationMetadata = {
              title: safeConvertData.toString(data.title),
              description: safeConvertData.toString(data.description),
              categories: safeConvertData.toString(data.categories),
              minLabel: safeConvertData.toString(data.minLabel),
              maxLabel: safeConvertData.toString(data.maxLabel),
              tags: Array.isArray(data.tags) ? data.tags : [],
              metadataCid: newCid,
            };
            setMetadata(newMetadata);
          }
        })
        .catch((error) => {
          if (mountedRef.current && error.name !== "AbortError") {
            if (processedCidRef.current === currentProcessedKey) {
              processedCidRef.current = null;
            }
            onErrorRef.current({
              message: `Failed to fetch metadata content: ${error.message}`,
              name: error.name,
              code: error.code,
              severity: "error",
            });
          }
        });
    }, 500); // Reduced delay

    // Cleanup timeout on effect cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isEnabled, address, surveyMetadataCidFetched, surveyMetadataCid]);

  // Handle errors from contract read
  useEffect(() => {
    if (surveyMetadataCidError && isEnabled && address) {
      const errorMessage = `Failed to fetch metadata CID: ${surveyMetadataCidError.message}`;
      const errorKey = `error:${address}-${errorMessage}`;

      if (processedCidRef.current !== errorKey) {
        processedCidRef.current = errorKey;
        onErrorRef.current({
          message: errorMessage,
          name: surveyMetadataCidError.name,
          severity: "error",
        });
      }
    }
  }, [surveyMetadataCidError, isEnabled, address]);

  // Function to manually refresh metadata
  const refreshStep2 = useCallback(() => {
    if (
      isEnabled &&
      address &&
      contractConfigsRef.current.generalSurveyContract
    ) {
      // Clear current metadata first to show loading state
      setMetadata(null);
      // Reset processed CID to allow re-processing
      processedCidRef.current = null;
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      refetchMetadataCid();
    }
  }, [isEnabled, address, refetchMetadataCid]);

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
