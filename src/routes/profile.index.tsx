import { createFileRoute } from '@tanstack/react-router'
import { useMemo, type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as authService from '@api/services/auth'
import { Button, Input } from '@nextui-org/react'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

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
        defaultValues: () =>
            queryClient.ensureQueryData({ queryKey: ['me'], queryFn: authService.getMe }).then((data) => data.me),
    })

    const onSubmit = handleSubmit(async (data) => {
        await authService.setMe(data)
        await queryClient.invalidateQueries({
            queryKey: ['me'],
        })
    })

    return (
        <form onSubmit={onSubmit}>
            <h1 className="mb-8 text-2xl">Общие настройки</h1>
            <div className="mb-6 flex max-w-sm flex-col gap-4">
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
            </div>
            <Button
                type="submit"
                color="primary"
                isLoading={isLoading || isSubmitting}
                isDisabled={isLoading || isSubmitting}
            >
                Сохранить
            </Button>
        </form>
    )
}

const Index: FC = () => {
    return (
        <div className="container mx-auto px-4">
            <div className="mt-12">
                <CommonDataForm />
            </div>
        </div>
    )
}

export const Route = createFileRoute('/profile/')({
    component: Index,
})
