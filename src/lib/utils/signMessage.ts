import { signMessage, verifyMessage } from "@wagmi/core";
import { wagmiConfig } from "../wagmi/config";
import { Address } from "viem";

const createNonce = (): string => {
  const nonce = Math.random().toString(36).substring(2, 15);
  return nonce;
};

const createMessage = (address: string, nonce: string): string => {
  const timestamp = new Date().toISOString();
  return `Sign this message to verify your address: ${address} with nonce: ${nonce} at ${timestamp}`;
};

export const sign = async (
  address: string
): Promise<{ message: string; signature: `0x${string}` }> => {
  if (!address) {
    throw new Error("Address is required to sign a message");
  }

  const nonce = createNonce();
  const message = createMessage(address, nonce);

  try {
    const signature = await signMessage(wagmiConfig, {
      account: address as Address,
      message,
    });
    return { message, signature };
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error("Failed to sign message");
  }
};

export const verify = async (
  address: string,
  message: string,
  signature: `0x${string}`
): Promise<boolean> => {
  if (!address || !message || !signature) {
    throw new Error(
      "Address, message, and signature are required for verification"
    );
  }

  try {
    const isVerified = await verifyMessage(wagmiConfig, {
      address: address as Address,
      message,
      signature,
    });

    if (!isVerified) {
      console.error("Signature verification failed");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error verifying message:", error);
    return false;
  }
};

export const signAndVerify = async (
  address: string
): Promise<{
  isVerified: boolean;
  signature: `0x${string}`;
  message: string;
}> => {
  const { message, signature } = await sign(address);
  const isVerified = await verify(address, message, signature);

  return {
    isVerified,
    signature,
    message,
  };
};
