import { queries } from '@/api/queries'
import { queryClient } from '@/main'
import { authenticated } from '@/router'
import { createFileRoute } from '@tanstack/react-router'
import { type FC } from 'react'

const Index: FC = () => {
    return (
        <>
            <div>HOME</div>
        </>
    )
}

export const Route = createFileRoute('/_dashboard/')({
    component: Index,
    beforeLoad: () =>
        authenticated(async () => {
            await queryClient.fetchQuery(queries.me.detail)
            return {
                title: '',
            }
        }),
})
