import { CreateMetadataRequestBody } from "@/app/api/metadata/route";
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "../wagmi/config";
import { QUESTIONNAIRE_ABIS } from "../contracts";
import { Address } from "viem";

const abis = QUESTIONNAIRE_ABIS;

export const setMetadata = async (
  constractAddress: Address,
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

    const data: { cid: string } = await result.json();
    if (!data.cid) {
      throw new Error("No CID returned from metadata API");
    }

    try {
      const txHash = await writeContract(wagmiConfig, {
        address: constractAddress,
        abi: abis.general,
        functionName: "setMetadata",
        args: [data.cid],
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
