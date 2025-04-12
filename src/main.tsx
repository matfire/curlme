import { createRoot } from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { PostHogProvider } from 'posthog-js/react'
import { routeTree } from './routeTree.gen';

const router = createRouter({routeTree})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const posthogOptions = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={posthogOptions}>
            <RouterProvider router={router} />
        </PostHogProvider>
    </StrictMode>
);
