import { FC } from 'react'
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import * as authService from '@api/services/auth'
import Topbar from '@/components/topbar'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'

const ProfileLayout: FC = () => {
    const navigate = useNavigate()

    return (
        <div>
            <Topbar />
            <div className="container mx-auto p-4">
                <Button className="flex items-center leading-none" variant="flat" onClick={() => navigate({ to: '/' })}>
                    <Icon icon="tabler:arrow-left" className="size-5" />
                    Назад
                </Button>
            </div>
            <Outlet />
        </div>
    )
}

export const Route = createFileRoute('/profile')({
    component: ProfileLayout,
    beforeLoad: async () => {
        const userData = await authService.getUserData()
        const isAuthenticated = !!userData?.accessToken
        if (!isAuthenticated) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },
            })
        }
    },
})
