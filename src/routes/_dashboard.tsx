import { Outlet, createFileRoute, useMatches, useNavigate, useRouterState } from '@tanstack/react-router'
import { type FC, useMemo } from 'react'

import MyNavigation from '@components/my-navigation'
import Topbar from '@/components/topbar'
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react'

const DashboardLayout: FC = () => {
    const matches = useMatches()
    const breadcrumbs = useMemo(() => {
        return matches
            .filter((m) => m.context.title)
            .map((m) => ({
                title: m.context.title,
                pathname: m.pathname,
            }))
    }, [matches])
    const navigate = useNavigate()
    const routerState = useRouterState()

    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 overflow-y-auto border-r border-gray-400/25 md:block">
                <MyNavigation />
            </aside>
            <div className="md:pl-64">
                <Topbar />
                <div className="p-4 md:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-x-2">
                        <Breadcrumbs
                            onAction={(key) =>
                                navigate({
                                    to: key.toString(),
                                } as any)
                            }
                        >
                            {breadcrumbs.map((b) => (
                                <BreadcrumbItem
                                    key={b.pathname}
                                    isCurrent={b.pathname === routerState.location.pathname}
                                >
                                    {b.title}
                                </BreadcrumbItem>
                            ))}
                        </Breadcrumbs>
                    </div>
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
