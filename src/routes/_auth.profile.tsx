import { FC } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import Topbar from '@/components/topbar'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'

const ProfileLayout: FC = () => {
    const navigate = useNavigate()

    return (
        <div>
            <Topbar showLogo />
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

export const Route = createFileRoute('/_auth/profile')({
    component: ProfileLayout,
})