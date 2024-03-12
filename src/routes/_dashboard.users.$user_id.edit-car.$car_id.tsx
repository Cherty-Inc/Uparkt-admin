import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type FC } from 'react'

import { queries } from '@/api/queries'
import Message from '@/components/message'
import { queryClient } from '@/main'
import { authenticated } from '@/router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import * as usersService from '@api/services/users'
import { toastError, toastSuccess } from '@/utils'
import { Button, Input, Skeleton } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import ConfirmButton from '@/components/confirm-button'

const schema = z.object({
    name: z.string(),
    number: z.string(),
})

const CarEdit: FC = () => {
    const { user_id: userID, car_id: carID } = Route.useParams()

    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data, isError, isSuccess } = useQuery(queries.users.one(userID)._ctx.cars._ctx.one(carID))

    const {
        handleSubmit,
        control,
        formState: { isLoading: isFormLoading, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: () => queryClient.ensureQueryData(queries.users.one(userID)._ctx.cars._ctx.one(carID)),
    })

    const { mutateAsync } = useMutation({
        mutationFn: usersService.setUserCar,
        onSuccess: () => {
            toastSuccess('Автомобиль обновлён')
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const { mutate: deleteCar } = useMutation({
        mutationFn: (vals: { userID: number; carID: number; carName?: string }) =>
            usersService.deleteUsersCar(vals.userID, vals.carID),
        onSuccess: async (_, vals) => {
            toastSuccess(['Автомобиль', vals.carName, 'удален'].filter(Boolean).join(' '))
            await navigate({
                to: '/users/$user_id/',
                params: {
                    user_id: userID,
                },
                search: {
                    view: ['cars'],
                },
                replace: true,
            })
            await queryClient.invalidateQueries(queries.users.one(vals.userID)._ctx.cars)
            queryClient.removeQueries(queries.users.one(vals.userID)._ctx.cars._ctx.one(vals.carID))
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const onSubmit = handleSubmit(async (data) => {
        await mutateAsync({
            ...data,
            id: Number(carID),
            id_user: Number(userID),
        })
        await queryClient.invalidateQueries(queries.users.one(userID)._ctx.cars)
    })

    return (
        <>
            {isError && <Message color="danger">Не удалось загрузить данные об автомобиле</Message>}
            {!isError && (
                <>
                    <Skeleton isLoaded={isSuccess}>
                        <div className="my-16">
                            <div className="flex justify-between gap-4">
                                <h1 className="text-4xl font-bold">{data?.name || 'Без названия'}</h1>
                                <ConfirmButton
                                    button={{ isIconOnly: true, color: 'danger', variant: 'shadow' }}
                                    popover={{ placement: 'bottom-end' }}
                                    onConfirm={() =>
                                        deleteCar({ userID: Number(userID), carID: Number(carID), carName: data?.name })
                                    }
                                >
                                    <Icon icon="tabler:trash" className="size-4" />
                                </ConfirmButton>
                            </div>
                            <p className="text-lg opacity-50">ID: {data?.id}</p>
                        </div>
                    </Skeleton>

                    <form className="flex max-w-sm flex-col gap-4" onSubmit={onSubmit}>
                        <Controller
                            name="name"
                            control={control}
                            disabled={isFormLoading || isSubmitting}
                            render={({ field, fieldState: { error } }) => (
                                <Input
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    isDisabled={field.disabled}
                                    label="Имя"
                                    errorMessage={error?.message}
                                />
                            )}
                        />
                        <Controller
                            name="number"
                            control={control}
                            disabled={isFormLoading || isSubmitting}
                            render={({ field, fieldState: { error } }) => (
                                <Input
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    isDisabled={field.disabled}
                                    label="Номера"
                                    errorMessage={error?.message}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            color="primary"
                            variant="shadow"
                            startContent={<Icon icon="tabler:device-floppy" className="size-5" />}
                            isLoading={isSubmitting}
                            isDisabled={isFormLoading || isSubmitting}
                        >
                            Сохранить
                        </Button>
                    </form>
                </>
            )}
        </>
    )
}

export const Route = createFileRoute('/_dashboard/users/$user_id/edit-car/$car_id')({
    component: CarEdit,
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            const data = await queryClient.fetchQuery(
                queries.users.one(params.user_id)._ctx.cars._ctx.one(params.car_id),
            )
            return {
                title: data.name,
            }
        }),
})
