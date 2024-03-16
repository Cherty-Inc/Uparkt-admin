// Import the generated route tree
import { createRouter, redirect } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

export { RouterProvider } from '@tanstack/react-router'
import * as authService from '@api/services/auth'
import { AxiosError } from 'axios'

// Create a new router instance
export const router = createRouter({
    routeTree,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export const authenticated = async <T>(hook: () => Promise<T>) => {
    try {
        const userData = await authService.getUserData()
        if (userData?.accessToken) {
            const result = await hook()
            return result
        } else {
            throw redirect({
                to: '/login',
            })
        }
    } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 401) {
            await authService.resetUserData()
            throw redirect({
                to: '/login',
            })
        }
    }
}
