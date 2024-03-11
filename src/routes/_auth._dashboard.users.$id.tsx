import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { type FC } from 'react'
import { queryClient } from '@/main'
import { AvatarIcon, Chip } from '@nextui-org/react'

import { queries } from '@/api/queries'
import Message from '@/components/message'

const UserDetails: FC = () => {
    const userID = useParams({
        from: '/_auth/_dashboard/users/$id',
        select: (p) => p.id,
    })

    const { data, isError } = useQuery({
        ...queries.users.user(userID),
    })

    return (
        <>
            {isError && <Message color="danger">Не удалось загрузить данные пользователя</Message>}

            {!isError && (
                <>
                    <div className="relative mt-12 flex flex-col items-center gap-8 md:flex-row">
                        <div className="absolute right-0 top-0 inline-block rounded-full bg-foreground-600 px-4 py-2 leading-none text-background shadow-lg shadow-black/25">
                            {data?.balance} ₽
                        </div>

                        <div className="flex size-48 items-center justify-center rounded-full bg-black !bg-opacity-10 text-foreground-600 dark:bg-white">
                            <AvatarIcon />
                        </div>
                        <div className="text-center md:text-start">
                            <h1 className="mb-2 text-2xl font-semibold">{[data?.name, data?.surname].join(' ')}</h1>
                            {data?.email && (
                                <a className="mb-2 block opacity-50" href={'mailto:' + data.email}>
                                    {data.email}
                                </a>
                            )}
                            {data?.phone && <p className="mb-2 opacity-50">{data.phone}</p>}
                            <div className="flex flex-wrap justify-center gap-1 md:justify-start">
                                {data?.role.map((r) => <Chip key={r}>{r}</Chip>)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard/users/$id')({
    component: UserDetails,
    beforeLoad: async ({ params }) => {
        try {
            const data = await queryClient.fetchQuery(queries.users.user(params.id))
            return {
                title: [data.name, data.surname].join(' '),
            }
        } catch {
            return {
                title: 'Ошибка',
            }
        }
    },
})
