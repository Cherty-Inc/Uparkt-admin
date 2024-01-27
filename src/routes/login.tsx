import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import * as authService from '@api/services/auth'
import { router } from '@/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Input, Image } from '@nextui-org/react'
import { toastError, toastSuccess } from '@/utils'

const validationSchema = z.object({
    login: z.string().min(1),
    password: z.string().min(1),
})

const LoginPage = () => {
    const { redirect } = Route.useSearch()
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: () => {
            toastSuccess('Успешно')
            const redirectTo = redirect || '/'
            console.log({ redirectTo })
            router.navigate({
                to: redirectTo,
            })
        },
        onError: () => {
            toastError('Не удалось войти')
        },
    })

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<z.infer<typeof validationSchema>>({
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = handleSubmit((vals) => {
        loginMutation.mutate(vals)
    })

    return (
        <>
            <div className="flex min-h-dvh items-end justify-center p-4 sm:items-center md:p-8">
                <Card className="w-full max-w-sm p-8">
                    <form onSubmit={onSubmit}>
                        <Image
                            radius="none"
                            draggable={false}
                            className="mx-auto mb-8 w-1/2 invert dark:invert-0"
                            src="/logo.svg"
                            isBlurred
                        />
                        <h1 className="mb-6 text-center text-xl font-medium">Войти</h1>
                        <Input
                            className="mb-4"
                            variant="bordered"
                            label="Логин"
                            isInvalid={!!errors.login?.message}
                            errorMessage={errors.login?.message}
                            {...register('login')}
                        />
                        <Input
                            className="mb-8"
                            variant="bordered"
                            label="Пароль"
                            type="password"
                            isInvalid={!!errors.password?.message}
                            errorMessage={errors.password?.message}
                            {...register('password')}
                        />

                        <Button
                            type="submit"
                            isDisabled={loginMutation.isPending}
                            color="primary"
                            className="w-full"
                            size="lg"
                            variant="bordered"
                        >
                            Войти
                        </Button>
                    </form>
                </Card>
            </div>
        </>
    )
}

export const Route = createFileRoute('/login')({
    component: LoginPage,
    validateSearch: z.object({
        redirect: z.string().optional(),
    }),
})
