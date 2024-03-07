import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, router } from '@/router'
import { NextUIProvider } from '@nextui-org/react'
import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/ru/zod.json'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.css'

import { startRevalidationProccess } from '@api/services/auth'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15 * 60 * 1000, // 15 minutes
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            retry: (_, error) => {
                console.error(error)
                return error.name !== 'ZodError'
            },
        },
    },
})

i18next.init({
    lng: 'ru',
    resources: {
        ru: { zod: translation },
    },
})
z.setErrorMap(zodI18nMap)

startRevalidationProccess()

// Render the app
const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <NextUIProvider>
                    <RouterProvider router={router} />
                </NextUIProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>,
    )
}
