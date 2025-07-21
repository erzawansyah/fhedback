import { CreateMetadataRequestBody } from "@/app/api/metadata/route";
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "../wagmi/config";
import {
  QUESTIONNAIRE_ABIS,
  QUESTIONNAIRE_FACTORY_ADDRESS,
} from "../contracts";
import { Address } from "viem";

const abis = QUESTIONNAIRE_ABIS;
const factoryAddress = QUESTIONNAIRE_FACTORY_ADDRESS;

export const setMetadata = async (
  body: CreateMetadataRequestBody
): Promise<`0x${string}`> => {
  try {
    const result = await fetch("/api/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      throw new Error("Failed to set metadata");
    }

    const cid = await result.text();

    try {
      const txHash = await writeContract(wagmiConfig, {
        address: factoryAddress as Address,
        abi: abis.general,
        functionName: "setMetadata",
        args: [cid],
      });
      return txHash as `0x${string}`;
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Error setting metadata:", error);
    throw new Error("Failed to set metadata");
  }
};
