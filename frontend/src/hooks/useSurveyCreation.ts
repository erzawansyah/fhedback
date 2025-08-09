import { signAndVerify } from "@/lib/utils/signMessage";
import { SurveyCreationStatus } from "@/types/survey-creation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

export const useSurveySteps = () => {
  const account = useAccount();
  const [status, setStatus] = useState<SurveyCreationStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    data: receipt,
    error,
    isSuccess,
    isError,
    isLoading,
  } = useWaitForTransactionReceipt({
    hash: txHash ? txHash : undefined,
    query: {
      enabled: !!txHash,
    },
  });

  const handleStatus = useCallback((newStatus: SurveyCreationStatus) => {
    setStatus(newStatus);
  }, []);

  const handleTxHash = useCallback((hash: `0x${string}` | null) => {
    setTxHash(hash);
  }, []);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setErrorMessage(null);
  }, []);

  const handleSign = async () => {
    if (!account.address) {
      throw new Error("No account address found");
    }

    try {
      setStatus("signing");
      const { isVerified, signature, message } = await signAndVerify(
        account.address
      );
      if (!isVerified) {
        throw new Error("Failed to verify account ownership");
      }
      setStatus("loading");
      return {
        isVerified,
        signature,
        message,
      };
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      return {
        isVerified: false,
        signature: null,
        message: null,
      };
    }
  };

  const handleError = useCallback((error: Error | string) => {
    setErrorMessage(error instanceof Error ? error.message : error);
    setStatus("error");
    // Reset transaction hash on error to allow retry
    setTxHash(null);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setStatus("verifying");
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      setStatus("success");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      handleError(
        error || "Unknown error occurred during transaction receipt retrieval"
      );
    }
  }, [isError, error, handleError]);

  useEffect(() => {
    if (status === "error" && errorMessage) {
      toast.error(`An error occurred: ${errorMessage}`);
    }
  }, [status, errorMessage]);

  return {
    account,
    status,
    receipt,
    isLoading,
    handleStatus,
    handleTxHash,
    handleSign,
    handleError,
    resetStatus,
  };
};
