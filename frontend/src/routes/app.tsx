import { Outlet, createFileRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AppSidebar from '../components/layout/AppSidebar'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import AppHeader from '../components/layout/AppHeader'
import { useAccount } from 'wagmi'
import { ConnectButton } from '../components/ConnectButton'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
  const account = useAccount()

  if (!account.isConnected) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center border-[4px] border-border">
        <h1 className="text-2xl font-bold mb-4">Connect your wallet to access the app</h1>
        <ConnectButton />
      </div>
    )
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <Outlet />
          <TanStackRouterDevtools
            position="bottom-right"
          />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
