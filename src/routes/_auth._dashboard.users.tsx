import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_dashboard/users')({
    component: Outlet,
    beforeLoad: () => ({
        title: 'Пользователи',
    }),
})
