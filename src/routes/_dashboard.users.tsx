import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/users')({
    component: Outlet,
    beforeLoad: () => ({
        title: 'Пользователи',
    }),
})
