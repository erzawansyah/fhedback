import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './services/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import NotFound from './components/NotFound'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { FhevmProvider } from './services/fhevm/FhevmProvider'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <NotFound />
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <FhevmProvider>
              <RouterProvider router={router} />
            </FhevmProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
