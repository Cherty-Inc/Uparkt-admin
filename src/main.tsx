import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, router } from '@/router'
import { NextUIProvider } from '@nextui-org/react'
import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/ru/zod.json'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

i18next.init({
    lng: 'ru',
    resources: {
        ru: { zod: translation },
    },
})
z.setErrorMap(zodI18nMap)

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
            </QueryClientProvider>
        </StrictMode>,
    )
}
