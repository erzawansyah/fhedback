import { config } from "@/lib/wagmi/config";
import {
  signMessage as sign,
  type SignMessageReturnType,
  type SignMessageErrorType,
} from "@wagmi/core";
import { generateNonce, generateTimestamp } from "./general";
import { Address } from "viem";
// Interface hasil signature, mengikuti tipe dari wagmi
export interface SignatureReturnInterface {
  signature: SignMessageReturnType;
}

export interface GenerateSignMessageReturnType {
  messages: string;
  timestamp: number;
  nonce: string;
}

export const signMessage = async (
  messages: string
): Promise<SignatureReturnInterface> => {
  try {
    // SignMessageReturnType adalah tipe hasil dari fungsi signMessage
    const signature: SignMessageReturnType = await sign(config, {
      message: messages,
    });
    return { signature };
  } catch (error) {
    // SignMessageErrorType bisa digunakan untuk type guard atau penanganan error spesifik
    if ((error as SignMessageErrorType)?.name) {
      console.error("Failed to sign wallet (SignMessageErrorType):", error);
    } else {
      console.error("Failed to sign wallet:", error);
    }
    throw error;
  }
};

export const generateSignMessage = (
  address: Address,
  actionMessage: string = "Contract Deployment on Platform",
  nonceLength: number = 32
): GenerateSignMessageReturnType => {
  const timestamp = generateTimestamp();
  const nonce = generateNonce(nonceLength);
  const result = {
    messages:
      `Wallet Ownership Confirmation\n` +
      `Address: ${address}\n` +
      `Nonce: ${nonce}\n` +
      `Timestamp: ${timestamp}\n` +
      `Action: ${actionMessage}\n` +
      `If you did not request this action, please ignore and do not sign this message.`,
    timestamp,
    nonce,
  };

  return result;
};
