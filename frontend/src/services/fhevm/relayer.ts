// Zama Relayer SDK integration for FHEVM (Sepolia)
// Provides a singleton relayer instance and helpers to encrypt survey responses

import type { Address } from 'viem'

// Minimal type surface we use from the SDK to avoid import-type coupling
type FhevmInstance = {
  createEncryptedInput: (
    contractAddress: Address,
    userAddress: Address,
  ) => {
    add8: (v: bigint) => void
    encrypt: () => Promise<unknown>
  }
}

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type EncryptResult = {
  handles: `0x${string}`[]
  inputProof: `0x${string}`
}

let relayerInstance: FhevmInstance | null = null
let initializing = false

// Load SDK in a way that works across different bundles/exports
async function loadRelayerSDK(): Promise<{
  initSDK: () => Promise<void>
  createInstance: (cfg: Record<string, unknown>) => Promise<FhevmInstance>
  SepoliaConfig: Record<string, unknown>
}> {
  // Try explicit bundle first (older docs), then package root
  let mod: unknown
  try {
    mod = await import('@zama-fhe/relayer-sdk/bundle')
  } catch {
    // ignore; try next path
  }
  if (!mod) {
    try {
      // Some versions export from the package root; types may be missing.
      // @ts-expect-error - optional import fallback
      mod = await import('@zama-fhe/relayer-sdk')
    } catch {
      // ignore; will error below if still missing
    }
  }

  const m = mod as Record<string, unknown> | undefined
  const sdk = (m && (m as { default?: unknown }).default) ?? m
  const initSDK = (sdk as Record<string, unknown> | undefined)?.initSDK as
    | (() => Promise<void>)
    | undefined
  const createInstance = (sdk as Record<string, unknown> | undefined)
    ?.createInstance as ((cfg: Record<string, unknown>) => Promise<FhevmInstance>) | undefined
  const SepoliaConfig = (sdk as Record<string, unknown> | undefined)
    ?.SepoliaConfig as Record<string, unknown> | undefined

  if (!initSDK || !createInstance || !SepoliaConfig) {
    throw new Error('Relayer SDK failed to load (initSDK/createInstance/SepoliaConfig not found)')
  }
  return { initSDK, createInstance, SepoliaConfig }
}

export async function getRelayerInstance(): Promise<FhevmInstance> {
  if (relayerInstance) return relayerInstance
  if (initializing) {
    // simple wait loop to avoid double init in rapid calls
    await new Promise((r) => setTimeout(r, 50))
    return getRelayerInstance()
  }
  initializing = true
  try {
    const { initSDK, createInstance, SepoliaConfig } = await loadRelayerSDK()
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
