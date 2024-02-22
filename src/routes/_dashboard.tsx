import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { FC } from 'react'

import * as authService from '@api/services/auth'

import MyNavigation from '@components/my-navigation'
import Topbar from '@/components/topbar'

const DashboardLayout: FC = () => {
    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 overflow-y-auto border-r border-gray-400/25 md:block">
                <MyNavigation />
            </aside>
            <div className="md:pl-64">
                <Topbar />
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_dashboard')({
    component: DashboardLayout,
    beforeLoad: async () => {
        const userData = await authService.getUserData()
        const isAuthenticated = !!userData?.accessToken
        if (!isAuthenticated) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },
            })
        }
    },
})
