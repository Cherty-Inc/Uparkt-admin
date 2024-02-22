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

import * as Sentry from '@sentry/react'

Sentry.init({
    dsn: 'https://84216aa2f8b8832bcf54f659c23f8774@o4506753135935488.ingest.sentry.io/4506790966198272',
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
        }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', 'https://server.uparkt.ru'],
    // Session Replay
    replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15 * 60 * 1000, // 15 minutes
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
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
