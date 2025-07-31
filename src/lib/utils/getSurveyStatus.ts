import { Abi, Address } from "viem";
import { QUESTIONNAIRE_ABIS as abis } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wagmi/config";
import { readContract } from "@wagmi/core";

export const getSurveyStatus = async (
  address: Address
): Promise<number | undefined> => {
  try {
    const result = await readContract(wagmiConfig, {
      address: address as Address,
      abi: abis.general as Abi,
      functionName: "status",
      args: [],
    });
    if (!result) {
      throw new Error("No details found for the given address");
    }

    return result as number;
  } catch (error) {
    console.error("Error fetching survey details:", error);
    return undefined;
  }
};
