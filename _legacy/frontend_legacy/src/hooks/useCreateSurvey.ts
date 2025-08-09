import { useEffect, useState } from "react";
import { CreateSurveyFormSchema } from "@/lib/schemas";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import {
  QUESTIONNAIRE_FACTORY_ABI,
  QUESTIONNAIRE_FACTORY_ADDRESS,
} from "@/lib/contracts";
import { generateSignMessage } from "@/utils/signatureHandler";
import { verifySignature } from "@/utils/verifySignature";
import { Address } from "viem";

type CreateSurveyStatus = "idle" | "loading" | "success" | "error";

export function useCreateSurvey() {
  const account = useAccount();
  const [status, setStatus] = useState<CreateSurveyStatus>("idle");
  const [signed, setSigned] = useState(false);
  const [txHash, setTxHash] = useState<Address | null>(null);
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (status === "idle") {
      setSigned(false);
      setTxHash(null);
    }
  }, [status]);

  const sign = async () => {
    if (!account.address) {
      throw new Error("No account address found");
    }
    const { messages } = generateSignMessage(
      account.address as Address,
      "Survey Contract Deployment"
    );
    try {
      const signature = await signMessageAsync({
        message: messages,
      });

      const verified = await verifySignature({
        message: messages,
        signature,
        expectedAddress: account.address as Address,
      });

      if (!verified) {
        throw new Error("Signature verification failed");
      }
      return true;
    } catch (error) {
      throw new Error(
        `Signing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const write = async (args: CreateSurveyFormSchema) => {
    if (!account.address) {
      throw new Error("No account address found");
    }
    try {
      const tx = await writeContractAsync({
        address: QUESTIONNAIRE_FACTORY_ADDRESS,
        abi: QUESTIONNAIRE_FACTORY_ABI,
        functionName: "createQuestionnaire",
        args: [
          args.fhePowered ? 1 : 0,
          args.title,
          args.scaleLimit,
          args.totalQuestions,
          args.respondentLimit,
        ],
      });
      return tx;
    } catch (error) {
      throw new Error(
        `Writing to contract failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const createSurvey = async (surveyData: CreateSurveyFormSchema) => {
    setStatus("loading");
    try {
      const isSigned = await sign();
      if (!isSigned) {
        throw new Error("Survey signing failed");
      }
      setSigned(true);
      const tx = await write(surveyData);
      if (!tx) {
        throw new Error("Transaction not returned from writeContractAsync");
      }
      setTxHash(tx);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      throw new Error(
        `Survey creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return {
    status,
    signed,
    txHash,
    setStatus,
    createSurvey,
  };
}
