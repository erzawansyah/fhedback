import { Outlet, createFileRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AppSidebar from '../components/layout/AppSidebar'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import AppHeader from '../components/layout/AppHeader'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
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
