import { Link, Outlet, createFileRoute, useMatches } from '@tanstack/react-router'
import { type FC, useMemo, Fragment } from 'react'

import MyNavigation from '@components/my-navigation'
import Topbar from '@/components/topbar'

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

    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 overflow-y-auto border-r border-gray-400/25 md:block">
                <MyNavigation />
            </aside>
            <div className="md:pl-64">
                <Topbar />
                <div className="p-4 md:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-x-2">
                        {breadcrumbs.map((b) => (
                            <Fragment key={b.pathname}>
                                <Link className="opacity-75 last-of-type:opacity-100" to={b.pathname}>
                                    {b.title}
                                </Link>
                                <span className="select-none opacity-75 last:hidden">/</span>
                            </Fragment>
                        ))}
                    </div>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard')({
    component: DashboardLayout,
    beforeLoad: () => {
        return {
            title: 'Дашборд',
        }
    },
})
