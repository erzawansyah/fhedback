import { useState, useEffect, useCallback, useMemo } from "react";
import { QUESTIONNAIRE_ABIS as abis } from "@/lib/contracts";
import { useReadContracts } from "wagmi";
import { Abi, Address } from "viem";
import { getMetadataContent } from "@/lib/utils/getMetadataContent";

export interface SurveyData {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  owner: string;
  maxScale: number;
  minLabel: string;
  maxLabel: string;
  questions: string[];
  estimatedTime: number;
  reward: number;
  currentResponses: number;
  maxResponses: number;
  isActive: boolean;
}

export interface UseSurveySubmissionResult {
  surveyData: SurveyData | null;
  isLoading: boolean;
  error: string[];
}

export const useSurveySubmission = (
  address: Address,
  encrypted: boolean = true
): UseSurveySubmissionResult => {
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [error, setError] = useState<string[]>([]);
  const [debouncedAddress, setDebouncedAddress] = useState<Address>(address);

  // Debounce address changes to prevent excessive requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  const contracts = useMemo(() => {
    return encrypted
      ? {
          address: debouncedAddress,
          abi: abis.fhe as Abi,
        }
      : {
          address: debouncedAddress,
          abi: abis.standard as Abi,
        };
  }, [encrypted, debouncedAddress]);

  // Memoized function to process survey data
  const processSurveyData = useCallback(
    (
      contractData: readonly unknown[],
      metadataContent: Record<string, unknown>
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedData = contractData as any[];
      const [
        ,
        owner,
        scaleLimit,
        totalRespondents,
        respondentLimit,
        status,
        questions,
      ] = typedData;

      const questionsArray =
        questions?.status === "success" ? (questions.result as string[]) : [];
      const estimatedTime = Math.max(1, Math.ceil(questionsArray.length * 0.5)); // 30 seconds per question
      const reward = questionsArray.length * 2; // 2 tokens per question

      const surveyData: SurveyData = {
        id: debouncedAddress,
        title: (metadataContent.title as string) || "Untitled Survey",
        description:
          (metadataContent.description as string) || "No description available",
        category: Array.isArray(metadataContent.categories)
          ? metadataContent.categories[0] || "General"
          : (metadataContent.categories as string) || "General",
        minLabel: (metadataContent.minLabel as string) || "Strongly Disagree",
        maxLabel: (metadataContent.maxLabel as string) || "Strongly Agree",
        tags: (metadataContent.tags as string[]) || [],

        // from contract
        owner: owner?.status === "success" ? (owner.result as string) : "",
        maxScale:
          scaleLimit?.status === "success" ? Number(scaleLimit.result) : 10,
        currentResponses:
          totalRespondents?.status === "success"
            ? Number(totalRespondents.result)
            : 0,
        maxResponses:
          respondentLimit?.status === "success"
            ? Number(respondentLimit.result)
            : 100,
        isActive: status?.status === "success" && Number(status.result) === 2,
        questions: questionsArray,
        estimatedTime,
        reward,
      };

      setSurveyData(surveyData);
    },
    [debouncedAddress]
  );

  const {
    data,
    isLoading,
    error: contractError,
  } = useReadContracts({
    contracts: [
      {
        ...contracts,
        functionName: "metadataCID",
        args: [],
      },
      {
        ...contracts,
        functionName: "owner",
        args: [],
      },
      {
        ...contracts,
        functionName: "scaleLimit",
        args: [],
      },
      {
        ...contracts,
        functionName: "totalRespondents",
        args: [],
      },
      {
        ...contracts,
        functionName: "respondentLimit",
        args: [],
      },
      {
        ...contracts,
        functionName: "status", // to ensure that the contract available to submit
        args: [],
      },
      {
        ...contracts,
        functionName: "getAllQuestions",
        args: [],
      },
    ],
    query: {
      enabled: !!debouncedAddress && !!contracts,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  });

  // Clear errors when address changes
  useEffect(() => {
    setError([]);
    setSurveyData(null);
  }, [debouncedAddress]);

  useEffect(() => {
    if (contractError) {
      // Handle rate limiting errors specifically
      if (
        contractError.message.includes("429") ||
        contractError.message.includes("Too Many Requests")
      ) {
        setError((prev) => [
          ...prev,
          `Rate limit exceeded. Please wait a moment before trying again.`,
        ]);
      } else {
        setError((prev) => [
          ...prev,
          `Contract error: ${contractError.message}`,
        ]);
      }
    }
  }, [contractError]);

  // fetch metadata by CID
  useEffect(() => {
    if (data && debouncedAddress) {
      // Reset errors when starting fresh data processing
      setError([]);

      // Check for contract errors
      let hasErrors = false;
      for (const item of data) {
        if (item && "error" in item && item.error) {
          hasErrors = true;
          const errorMsg = item.error.message;
          if (
            errorMsg.includes("429") ||
            errorMsg.includes("Too Many Requests")
          ) {
            setError((prev) => [
              ...prev,
              `Rate limit exceeded. Please wait before retrying.`,
            ]);
          } else {
            setError((prev) => [...prev, `Failed to fetch data: ${errorMsg}`]);
          }
        }
      }

      // If there are errors, don't proceed with metadata fetching
      if (hasErrors) {
        return;
      }

      const [metadataCID] = data;

      if (metadataCID && !metadataCID.error) {
        getMetadataContent(metadataCID.result as string)
          .then((metadataContent) => {
            processSurveyData(data, metadataContent);
          })
          .catch((err) => {
            if (
              err.message.includes("429") ||
              err.message.includes("Too Many Requests")
            ) {
              setError((prev) => [
                ...prev,
                `Rate limit exceeded while fetching metadata. Please wait before retrying.`,
              ]);
            } else {
              setError((prev) => [
                ...prev,
                `Failed to fetch metadata: ${err.message}`,
              ]);
            }
          });
      }
    }
  }, [data, processSurveyData, debouncedAddress]);

  return {
    surveyData,
    isLoading:
      isLoading || (!!debouncedAddress && !surveyData && error.length === 0),
    error,
  };
};
