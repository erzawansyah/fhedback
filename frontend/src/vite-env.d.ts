/// <reference types="vite/client" />

// CSS Module declarations
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// CSS files as strings
declare module '*.css?inline' {
  const content: string
  export default content
}

// Asset declarations
declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react'
  const src: string
  export default src
  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_NODE_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ZAMA_TESTNET_RPC: string
  readonly VITE_ZAMA_RELAYER_URL: string
  readonly VITE_PINATA_JWT: string
  readonly VITE_PINATA_GATEWAY_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ANALYTICS_ID: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
