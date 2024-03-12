import { Outlet, createFileRoute } from '@tanstack/react-router'
import { type FC } from 'react'

import MyNavigation from '@components/my-navigation'
import Topbar from '@/components/topbar'
import MyBreadcrumbs from '@/components/my-breadcrumbs'

const DashboardLayout: FC = () => {
    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 overflow-y-auto border-r border-gray-400/25 md:block">
                <MyNavigation />
            </aside>
            <div className="md:pl-64">
                <Topbar />

                <div className="m-4 md:hidden">
                    <MyBreadcrumbs />
                </div>

                <div className="m-4 md:m-8">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_dashboard')({
    component: DashboardLayout,
    beforeLoad: () => ({
        title: 'Дашборд',
    }),
})
