import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal types we need from the SDK
type EncryptedInputBuffer = {
  add8: (v: bigint) => void
  encrypt: () => Promise<unknown>
}

export type FhevmInstance = {
  createEncryptedInput: (
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
  ) => EncryptedInputBuffer
}

type FhevmRelayerSDK = {
  initSDK: (options?: unknown) => Promise<boolean>
  createInstance: (config: Record<string, unknown>) => Promise<FhevmInstance>
  SepoliaConfig: Record<string, unknown>
  __initialized__?: boolean
}

type FhevmWindow = Window & { relayerSDK?: FhevmRelayerSDK }

const SDK_CDN_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.1.2/relayer-sdk-js.umd.cjs'

function loadSDKScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'))
    const w = window as unknown as FhevmWindow
    if (w.relayerSDK) return resolve()
    const existing = document.querySelector(`script[data-fhevm-sdk="${SDK_CDN_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('SDK script failed to load')), { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = SDK_CDN_URL
    s.async = true
    s.defer = true
    s.dataset.fhevmSdk = SDK_CDN_URL
    s.addEventListener('load', () => resolve(), { once: true })
    s.addEventListener('error', () => reject(new Error('SDK script failed to load')), { once: true })
    document.head.appendChild(s)
  })
}

export type FhevmStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useFhevm(parameters: {
  provider: unknown
  enabled?: boolean
}): { instance: FhevmInstance | undefined; status: FhevmStatus; error?: Error; refresh: () => void } {
  const { provider, enabled = true } = parameters
  const [instance, setInstance] = useState<FhevmInstance | undefined>(undefined)
  const [status, setStatus] = useState<FhevmStatus>('idle')
  const [error, setError] = useState<Error | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(() => {
    // Abort any previous run
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setInstance(undefined)
    setError(undefined)
    setStatus('idle')

    if (!enabled || !provider) return

    const controller = new AbortController()
    abortRef.current = controller

    const run = async () => {
      try {
        setStatus('loading')
        await loadSDKScript()
        if (controller.signal.aborted) return
        const w = window as unknown as FhevmWindow
        if (!w.relayerSDK) throw new Error('Relayer SDK not available on window')
        if (w.relayerSDK.__initialized__ !== true) {
          const ok = await w.relayerSDK.initSDK()
          if (!ok) throw new Error('initSDK failed')
          w.relayerSDK.__initialized__ = true
        }
        if (controller.signal.aborted) return
        const cfg = { ...(w.relayerSDK.SepoliaConfig || {}), network: provider }
        const inst = await w.relayerSDK.createInstance(cfg)
        if (controller.signal.aborted) return
        setInstance(inst)
        setStatus('ready')
      } catch (e) {
        if (controller.signal.aborted) return
        setError(e as Error)
        setStatus('error')
      }
    }

    run()
  }, [provider, enabled])

  useEffect(() => {
    refresh()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [refresh])

  return { instance, status, error, refresh }
}
