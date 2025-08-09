import { recoverMessageAddress } from "viem";

export async function verifySignature({
  message,
  signature,
  expectedAddress,
}: {
  message: string;
  signature: `0x${string}`;
  expectedAddress: string;
}) {
  const recovered = await recoverMessageAddress({
    message,
    signature,
  });
  return recovered.toLowerCase() === expectedAddress.toLowerCase();
}
