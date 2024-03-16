import { Outlet, createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/main'
import { queries } from '@/api/queries'
import { authenticated } from '@/router'

export const Route = createFileRoute('/_dashboard/users/$user_id')({
    component: Outlet,
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            const data = await queryClient.fetchQuery(queries.users.one(params.user_id))
            const title = [data.name, data.surname].join(' ').trim()
            return {
                title: title || 'Без имени',
            }
        }),
})
