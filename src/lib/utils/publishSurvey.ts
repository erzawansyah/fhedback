import { wagmiConfig } from "@/lib/wagmi/config";
import { writeContract } from "@wagmi/core";
import { Address } from "viem";
import { QUESTIONNAIRE_ABIS } from "../contracts";

const abis = QUESTIONNAIRE_ABIS;

/**
 * Utility function to publish a survey to the blockcnhain
 * This function handles the final step of making a survey live and available for respondents
 *
 * @param addr - The deployed survey contract address
 * @returns Promise<string> - Transaction hash of the publish transaction
 */
export async function publishSurvey(addr: Address): Promise<string> {
  try {
    const txHash = await writeContract(wagmiConfig, {
      address: addr,
      abi: abis.general,
      functionName: "publish",
    });

    if (!txHash) {
      throw new Error("Transaction hash is undefined");
    }

    return txHash as `0x${string}`;
  } catch (error) {
    console.error("Error publishing survey:", error);
    throw new Error("Failed to publish survey. Please try again.");
  }
}
