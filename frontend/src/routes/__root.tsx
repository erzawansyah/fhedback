import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useMemo } from 'react'
import Header from '@/components/layout/Header'
export const Route = createRootRoute({
    component: RootLayout,
})

function RootLayout() {
    const location = useRouterState({ select: s => s.location })
    const isApp = useMemo(() => {
        return location.pathname.startsWith('/app')
    }, [location.pathname])


    return (
        <>
            {!isApp && <Header />}
            <Outlet />
            <TanStackRouterDevtools
                position="bottom-right"
            />
        </>
    )
}
