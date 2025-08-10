import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AppSidebar from '../components/layout/AppSidebar'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import AppHeader from '../components/layout/AppHeader'

export const Route = createRootRoute({
    component: RootLayout,
})

function RootLayout() {
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
