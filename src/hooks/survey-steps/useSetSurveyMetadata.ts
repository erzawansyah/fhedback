import { useCallback, useEffect, useRef, useState } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { getMetadataContent } from "@/lib/utils/getMetadataContent";
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

// Helper function to safely convert data
const safeConvertData = {
  toString: (data: unknown, fallback: string = ""): string => {
    return data != null && data.toString().length > 0 ? String(data) : fallback;
  },
};

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

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const processedCidRef = useRef<string | null>(null); // Track processed CID to prevent loops

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
        isEnabled && !!address && !!contractConfigs.generalSurveyContract,
      retry: 1, // Reduce retry attempts
      retryDelay: 2000, // Increase retry delay
      refetchOnMount: false, // Don't refetch on mount to prevent spam
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 60000, // Cache for 1 minute
      refetchInterval: false, // Disable automatic refetching
    },
  });

  // Clear metadata when address changes or is null
  useEffect(() => {
    if (!address) {
      setMetadata(null);
      processedCidRef.current = null; // Reset processed CID when address changes
    }
  }, [address]);

  // Handle metadata CID updates with abort controller for cleanup
  useEffect(() => {
    // Early returns for safety
    if (
      !mountedRef.current ||
      !isEnabled ||
      !address ||
      !contractConfigs.generalSurveyContract
    ) {
      return;
    }

    if (surveyMetadataCidError) {
      const errorMessage = `Failed to fetch metadata CID: ${surveyMetadataCidError.message}`;
      // Only report error once per CID
      if (processedCidRef.current !== `error:${errorMessage}`) {
        processedCidRef.current = `error:${errorMessage}`;
        onError({
          message: errorMessage,
          name: surveyMetadataCidError.name,
          severity: "error",
        });
      }
      return;
    }

    if (surveyMetadataCidFetched && surveyMetadataCid) {
      const newCid = surveyMetadataCid as string;

      // Skip if we've already processed this CID
      if (processedCidRef.current === newCid) {
        console.log(`Skipping already processed CID: ${newCid}`);
        return;
      }

      console.log(`Processing metadata CID: ${newCid}`);

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Mark this CID as being processed
      processedCidRef.current = newCid;

      // Set loading state by clearing metadataCid only
      setMetadata(
        (prev) => ({ ...prev, metadataCid: null } as SurveyCreationMetadata)
      );

      // Add delay to prevent rapid-fire requests
      setTimeout(() => {
        // Check if still mounted and CID is still current
        if (!mountedRef.current || processedCidRef.current !== newCid) {
          console.log(
            `Aborting metadata fetch for CID: ${newCid} - component unmounted or CID changed`
          );
          return;
        }

        // Fetch metadata content
        getMetadataContent(newCid)
          .then((data) => {
            // Check if component is still mounted and CID is still current
            if (mountedRef.current && processedCidRef.current === newCid) {
              const newMetadata: SurveyCreationMetadata = {
                title: safeConvertData.toString(data.title),
                description: safeConvertData.toString(data.description),
                categories: safeConvertData.toString(data.categories),
                minLabel: safeConvertData.toString(data.minLabel),
                maxLabel: safeConvertData.toString(data.maxLabel),
                tags: Array.isArray(data.tags) ? data.tags : [],
                metadataCid: newCid, // Set the CID that was fetched
              };
              console.log(`Metadata loaded for CID: ${newCid}`, newMetadata);
              setMetadata(newMetadata);
            }
          })
          .catch((error) => {
            // Only add error if not aborted and component is mounted
            if (mountedRef.current && error.name !== "AbortError") {
              // Reset processed CID on error so it can be retried manually
              if (processedCidRef.current === newCid) {
                processedCidRef.current = null;
              }
              console.error(
                `Failed to fetch metadata for CID: ${newCid}`,
                error
              );
              onError({
                message: `Failed to fetch metadata content: ${error.message}`,
                name: error.name,
                code: error.code,
                severity: "error",
              });
            }
          });
      }, 1000); // Increased delay to 1 second to prevent spam
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    isEnabled,
    address,
    contractConfigs.generalSurveyContract,
    surveyMetadataCidFetched,
    surveyMetadataCid,
    surveyMetadataCidError,
    onError,
  ]);

  // Function to manually refresh metadata
  const refreshStep2 = useCallback(() => {
    if (isEnabled && address && contractConfigs.generalSurveyContract) {
      // Clear current metadata first to show loading state
      setMetadata(null);
      // Reset processed CID to allow re-processing
      processedCidRef.current = null;
      refetchMetadataCid();
    }
  }, [
    isEnabled,
    address,
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
