import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import * as authService from '@api/services/auth'

export const Route = createFileRoute('/_auth')({
    component: () => <Outlet />,
    beforeLoad: async () => {
        const isAuthenticated = await authService.isAuthenticated()
        if (!isAuthenticated) {
            await authService.resetUserData()
            throw redirect({
                to: '/login',
            })
        }

        return {
            title: '',
        }
    },
})
