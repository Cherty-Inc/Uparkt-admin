import { Outlet, createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/main'
import { queries } from '@/api/queries'
import { authenticated } from '@/router'

export const Route = createFileRoute('/_dashboard/users/$user_id')({
    component: Outlet,
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            const data = await queryClient.fetchQuery(queries.users.user(params.user_id))
            return {
                title: [data.name, data.surname].join(' '),
            }
        }),
})
