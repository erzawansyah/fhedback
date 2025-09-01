// Zama Relayer SDK integration for FHEVM (Sepolia)
// Provides a singleton relayer instance and helpers to encrypt survey responses

import type { Address } from 'viem'
import { initSDK, createInstance, SepoliaConfig, type FhevmInstance } from '@zama-fhe/relayer-sdk/bundle'

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type EncryptResult = {
  handles: `0x${string}`[]
  inputProof: `0x${string}`
}

let relayerInstance: FhevmInstance | null = null
let initializing = false

export async function getRelayerInstance(): Promise<FhevmInstance> {
  if (relayerInstance) return relayerInstance
  if (initializing) {
    // simple wait loop to avoid double init in rapid calls
    await new Promise((r) => setTimeout(r, 50))
    return getRelayerInstance()
  }
  initializing = true
  try {
    await initSDK() // load WASM
  const maybeEth = (globalThis as unknown as { ethereum?: EIP1193Provider }).ethereum
  const network = maybeEth
    const cfg = { ...SepoliaConfig, network }
    relayerInstance = await createInstance(cfg)
    return relayerInstance
  } finally {
    initializing = false
  }
}

// Encrypts an array of uint8 responses for the ConfidentialSurvey.submitResponses
export async function encryptSurveyResponses(
  surveyAddress: Address,
  userAddress: Address,
  values: number[],
) {
  const instance = await getRelayerInstance()

  const buffer = instance.createEncryptedInput(surveyAddress, userAddress)
  for (const v of values) {
    // Contract expects externalEuint8[]
    // Use add8 with BigInt for SDK
    buffer.add8(BigInt(v))
  }
  const ciphertexts = (await buffer.encrypt()) as unknown as EncryptResult

  // Normalized return
  const handles = ciphertexts.handles
  const inputProof = ciphertexts.inputProof

  return { handles, inputProof }
}
