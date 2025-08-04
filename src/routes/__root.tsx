import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AppSidebar from '../components/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'

export const Route = createRootRoute({
    component: RootLayout,
})

function RootLayout() {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-200">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">FhedBack Dashboard</h1>
                        </div>
                    </header>
                    <div className="flex-1 p-6">
                        <Outlet />
                        <TanStackRouterDevtools
                            position="bottom-right"
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}
