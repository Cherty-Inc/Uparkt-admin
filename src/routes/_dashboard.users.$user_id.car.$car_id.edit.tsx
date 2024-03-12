import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { type FC } from 'react'

import { queries } from '@/api/queries'
import Message from '@/components/message'
import { queryClient } from '@/main'
import { authenticated } from '@/router'

const UserDetails: FC = () => {
    const { user_id: userID, car_id: carID } = useParams({
        from: '/_dashboard/users/$user_id/car/$car_id/edit',
    })

    const { data, isError } = useQuery(queries.users.user(userID)._ctx.car(carID))

    return (
        <>
            {isError && <Message color="danger">Не удалось загрузить данные пользователя</Message>}
            {!isError && (
                <div className="mt-16">
                    <h1 className="text-4xl font-bold">{data?.name || 'Без названия'}</h1>
                    <p className="text-xl opacity-50">ID: {data?.id}</p>
                </div>
            )}
        </>
    )
}

export const Route = createFileRoute('/_dashboard/users/$user_id/car/$car_id/edit')({
    component: UserDetails,
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            const data = await queryClient.fetchQuery(queries.users.user(params.user_id)._ctx.car(params.car_id))
            return {
                title: data.name,
            }
        }),
})
