import { wagmiConfig } from "@/lib/wagmi/config";
import { writeContract } from "@wagmi/core";
import { Address } from "viem";
import { QUESTIONNAIRE_ABIS } from "../contracts";
import { verify } from "./signMessage";

const abis = QUESTIONNAIRE_ABIS;

export interface QuestionSubmissionData {
  address: `0x${string}`;
  signature: string | `0x${string}`;
  message: string;
  isFhe: boolean;
  questions: string[];
}

/**
 * Submit questions to survey contract
 * @param contractAddress - The survey contract address
 * @param data - Questions and verification data
 * @returns Transaction hash if successful
 */
export const submitQuestions = async (
  contractAddress: `0x${string}`,
  data: QuestionSubmissionData
): Promise<`0x${string}` | null> => {
  try {
    const { address, signature, message, isFhe, questions } = data;
    const isVerified = await verify(
      address,
      message,
      signature as `0x${string}`
    );

    if (!isVerified) {
      throw new Error("Signature verification failed");
    }

    const abi = isFhe ? abis.fhe : abis.standard;

    const txHash = await writeContract(wagmiConfig, {
      address: contractAddress as Address,
      abi: abi,
      functionName: "addQuestions",
      args: [questions],
    });

    if (!txHash) {
      throw new Error("Transaction hash is null");
    }

    return txHash;
  } catch (error) {
    console.error("Error submitting questions:", error);
    throw new Error(
      `Failed to submit questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
