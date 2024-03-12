import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, router } from '@/router'
import { NextUIProvider } from '@nextui-org/react'
import i18next from 'i18next'
import { ZodError, z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from 'zod-i18n-map/locales/ru/zod.json'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import * as authService from '@api/services/auth'

import './index.css'
import localforage from 'localforage'
import { AxiosError } from 'axios'

localforage.config({
    driver: localforage.LOCALSTORAGE,
})

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 15 * 60 * 1000, // 15 minutes
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            retry: (failureCount, error) => {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        return false
                    }
                }
                if (error instanceof ZodError) {
                    return false
                }
                return failureCount < 2
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

const render = async () => {
    const userData = await authService.getUserData()
    if (userData) {
        await authService.revalidateToken()
    }
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
}

render()
