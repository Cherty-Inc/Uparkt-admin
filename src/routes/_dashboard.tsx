import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import type { FC } from 'react'
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    useDisclosure,
    Button,
    Modal,
    ModalContent,
    Switch,
} from '@nextui-org/react'

import * as authService from '@api/services/auth'

import MyNavigation from '@components/my-navigation'
import { Icon } from '@iconify/react'
import { SunIcon, MoonIcon } from '@/icons'
import { useDarkMode } from 'usehooks-ts'

const DashboardLayout: FC = () => {
    const navigate = useNavigate()
    const { set, isDarkMode } = useDarkMode()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const logout = () => {
        navigate({
            to: '/login',
            replace: true,
        })
        authService.logout()
    }

    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 overflow-y-auto border-r border-gray-400/25 md:block">
                <MyNavigation />
            </aside>
            <div className="md:pl-64">
                <div className="flex items-center gap-6 border-b border-gray-400/25 p-4 md:flex-row-reverse">
                    <div className="flex items-center gap-4 md:flex-row-reverse">
                        <Dropdown placement="bottom">
                            <DropdownTrigger>
                                <Avatar
                                    isBordered
                                    radius="md"
                                    as="button"
                                    name="А"
                                    className="transition-transform"
                                    color="primary"
                                />
                            </DropdownTrigger>
                            <DropdownMenu disabledKeys={['profile']} aria-label="Profile Actions" variant="flat">
                                <DropdownItem
                                    key="profile"
                                    textValue="Профиль"
                                    isReadOnly
                                    className="h-14 gap-2 opacity-100"
                                >
                                    <p className="font-semibold">Вошли как</p>
                                    <p className="font-semibold">Администратор</p>
                                </DropdownItem>
                                <DropdownItem key="logout" color="danger" onClick={logout}>
                                    Выйти
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Switch
                            isSelected={isDarkMode}
                            size="lg"
                            color="primary"
                            onValueChange={set}
                            startContent={<MoonIcon />}
                            endContent={<SunIcon />}
                        ></Switch>
                    </div>
                    <div className="grow"></div>
                    <Button className="md:hidden" onClick={onOpen} isIconOnly variant="ghost">
                        <Icon icon="prime:bars" className="size-6" />
                    </Button>
                </div>
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <div onClick={onClose} className="-z-10 overflow-y-auto">
                            <MyNavigation />
                        </div>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export const Route = createFileRoute('/_dashboard')({
    component: DashboardLayout,
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