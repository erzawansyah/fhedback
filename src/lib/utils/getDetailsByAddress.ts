import { Abi, Address } from "viem";
import {
  QUESTIONNAIRE_ABIS as abis,
  QUESTIONNAIRE_FACTORY_ADDRESS as factoryContractAddress,
} from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wagmi/config";
import { readContract } from "@wagmi/core";

export type SurveyDetails = [Address, 0 | 1, Address, bigint];
const factoryAbi = abis.factory as Abi;
export type Survey = {
  address: Address;
  type: 0 | 1;
  owner: Address;
  createdAt: bigint;
};

export const getDetailsByAddress = async (
  address: Address
): Promise<SurveyDetails | undefined> => {
  try {
    const result = await readContract(wagmiConfig, {
      address: factoryContractAddress as Address,
      abi: factoryAbi,
      functionName: "getQuestionnaireDetailsByAddress",
      args: [address],
    });
    if (!result) {
      throw new Error("No details found for the given address");
    }

    return result as SurveyDetails;
  } catch (error) {
    console.error("Error fetching survey details:", error);
    return undefined;
  }
};
