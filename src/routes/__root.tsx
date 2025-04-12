import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from '@/components/ui/tooltip'
import NotFound from '@/components/NotFound'

export const Route = createRootRoute({
    component: RootComponent,
    notFoundComponent: NotFound
})

function RootComponent() {
    return (
        <React.Fragment>
            <TooltipProvider>
                <Toaster />
                <TanStackRouterDevtools />
                <Outlet />
            </TooltipProvider>
        </React.Fragment>
    )
}
