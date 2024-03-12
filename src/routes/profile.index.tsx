import { createFileRoute } from '@tanstack/react-router'
import { useMemo, type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as authService from '@api/services/auth'
import { Button, Input } from '@nextui-org/react'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastSuccess, toastError } from '@/utils'
import { Icon } from '@iconify/react/dist/iconify.js'
import { queries } from '@/api/queries'
import { authenticated } from '@/router'
import { queryClient } from '@/main'

const CommonDataForm: FC = () => {
    const queryClient = useQueryClient()
    const schema = useMemo(
        () =>
            z.object({
                name: z.string().optional(),
                surname: z.string().optional(),
            }),
        [],
    )

    const {
        handleSubmit,
        control,
        formState: { isLoading, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: () => queryClient.ensureQueryData(queries.me.detail),
    })

    const { mutateAsync } = useMutation({
        mutationFn: authService.setMe,
        onSuccess: () => {
            toastSuccess('Данные сохранены')
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const onSubmit = handleSubmit(async (data) => {
        await mutateAsync(data)
        await queryClient.invalidateQueries({
            queryKey: queries.me._def,
        })
    })

    return (
        <form onSubmit={onSubmit}>
            <h1 className="mb-4 text-lg">Профиль</h1>
            <div className="flex max-w-sm flex-col items-start gap-4">
                <Controller
                    name="name"
                    control={control}
                    disabled={isLoading || isSubmitting}
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
                    name="surname"
                    control={control}
                    disabled={isLoading || isSubmitting}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            onValueChange={field.onChange}
                            value={field.value}
                            onBlur={field.onBlur}
                            isDisabled={field.disabled}
                            label="Фамилия"
                            errorMessage={error?.message}
                        />
                    )}
                />
                <Button
                    type="submit"
                    color="primary"
                    startContent={<Icon icon="tabler:device-floppy" className="size-5" />}
                    isLoading={isSubmitting}
                    isDisabled={isLoading || isSubmitting}
                >
                    Сохранить
                </Button>
            </div>
        </form>
    )
}

const ChangePasswordForm: FC = () => {
    const queryClient = useQueryClient()
    const schema = useMemo(
        () =>
            z.object({
                last_password: z.string(),
                password: z.string(),
            }),
        [],
    )

    const {
        handleSubmit,
        control,
        formState: { isLoading, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    })

    const { mutateAsync } = useMutation({
        mutationFn: authService.changePassword,
        onSuccess: () => {
            toastSuccess('Пароль обновлён')
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const onSubmit = handleSubmit(async (data) => {
        await mutateAsync(data)
        await queryClient.invalidateQueries({
            queryKey: queries.me._def,
        })
    })

    return (
        <form onSubmit={onSubmit}>
            <h1 className="mb-4 text-lg">Изменить пароль</h1>
            <div className="flex flex-wrap items-center gap-4">
                <Controller
                    name="last_password"
                    control={control}
                    disabled={isLoading || isSubmitting}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            className="max-w-sm"
                            onValueChange={field.onChange}
                            value={field.value}
                            onBlur={field.onBlur}
                            isDisabled={field.disabled}
                            label="Старый пароль"
                            errorMessage={error?.message}
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    disabled={isLoading || isSubmitting}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            className="max-w-sm"
                            onValueChange={field.onChange}
                            value={field.value}
                            onBlur={field.onBlur}
                            isDisabled={field.disabled}
                            label="Новый пароль"
                            errorMessage={error?.message}
                        />
                    )}
                />
                <Button
                    type="submit"
                    color="danger"
                    startContent={<Icon icon="tabler:device-floppy" className="size-5" />}
                    isLoading={isSubmitting}
                    isDisabled={isLoading || isSubmitting}
                >
                    Сохранить
                </Button>
            </div>
        </form>
    )
}

const Index: FC = () => {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="mb-16">
                <h1 className="mb-8 text-2xl">Общие настройки</h1>
                <CommonDataForm />
            </div>

            <div className="mb-16">
                <h1 className="mb-8 text-2xl font-bold text-danger">Опасно</h1>
                <ChangePasswordForm />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/profile/')({
    component: Index,
    beforeLoad: () =>
        authenticated(async () => {
            await queryClient.fetchQuery(queries.me.detail)
            return {
                title: '',
            }
        }),
})
