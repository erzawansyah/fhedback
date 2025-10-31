// NOTE: we dynamically import the SDK from the CDN to bypass local bundling issues
// and ensure we are using the exact 0.2.0 browser bundle.
// Vite supports HTTP(S) imports; we keep the import inside the function to avoid TLA.

import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';

let fheInstance: FhevmInstance | null = null;

export async function initializeFheInstance() {
  // Check if ethereum is available (prevents mobile crashes)
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  // Load SDK from CDN (0.2.0)
  // @ts-expect-error  'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js' has no types
  const sdk: unknown = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
  // eslint-disable-next-line
  const { initSDK, createInstance, SepoliaConfig } = sdk as any;

  await initSDK(); // Loads WASM
  const config = { ...SepoliaConfig, network: window.ethereum };
  try {
    fheInstance = await createInstance(config);

    return fheInstance;
  } catch (err) {
    console.error('FHEVM instance creation failed:', err);
    throw err;
  }
}

export function getFheInstance() {
  return fheInstance;
} 

// Decrypt a single encrypted value using the relayer
export async function decryptValue(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    // Always pass an array of hex strings
    const handle = encryptedBytes;
    if (typeof handle === "string" && handle.startsWith("0x") && handle.length === 66) {
      const values = await fhe.publicDecrypt([handle]);
      // values is an object: { [handle]: value }
      return Number(values[handle]);
    } else {
      throw new Error('Invalid ciphertext handle for decryption');
    }
    // disable-next-line error for any declared catch type

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) { 
    // Check for relayer/network error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
} 
