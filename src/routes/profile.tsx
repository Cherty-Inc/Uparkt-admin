import { FC } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import Topbar from '@/components/topbar'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { authenticated } from '@/router'
import MyBreadcrumbs from '@/components/my-breadcrumbs'

const ProfileLayout: FC = () => {
    const navigate = useNavigate()

    return (
        <div>
            <Topbar showLogo />
            <div className="container mx-auto my-4 px-4">
                <div className="my-4 md:hidden">
                    <MyBreadcrumbs />
                </div>
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
    beforeLoad: () =>
        authenticated(async () => {
            return {
                title: 'Настройки',
            }
        }),
})
