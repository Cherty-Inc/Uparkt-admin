// Import the generated route tree
import { createRouter, redirect } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

export { RouterProvider } from '@tanstack/react-router'
import * as authService from '@api/services/auth'

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
        const result = await hook()
        return result
    } catch {
        await authService.resetUserData()
        throw redirect({
            to: '/login',
        })
    }
}
