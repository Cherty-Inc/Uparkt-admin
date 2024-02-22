import { MoonIcon, SunIcon } from '@/icons'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalContent,
    Switch,
    User,
    useDisclosure,
    Image,
} from '@nextui-org/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FC } from 'react'

import * as authService from '@api/services/auth'
import { Icon } from '@iconify/react/dist/iconify.js'
import MyNavigation from './my-navigation'
import { useDarkMode } from 'usehooks-ts'

const Topbar: FC<{
    showLogo?: boolean
}> = (props) => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { set: setIsDarkMode, isDarkMode } = useDarkMode()
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const { data: me } = useQuery({
        queryKey: ['me'],
        queryFn: authService.getMe,
        select: (data) => data.me,
    })

    const logout = async () => {
        await authService.logout()
        await navigate({
            to: '/login',
            replace: true,
        })
        queryClient.removeQueries()
    }
    return (
        <div className="sticky top-0 z-50 border-b border-gray-400/25 bg-background/50 p-4 backdrop-blur">
            <div className="container mx-auto flex items-center gap-6 md:flex-row-reverse">
                <div className="flex items-center gap-4 md:flex-row-reverse">
                    <Dropdown placement="bottom">
                        <DropdownTrigger>
                            <User
                                as="button"
                                className="transition-transform"
                                name={[me?.name, me?.surname].filter(Boolean).join(' ')}
                                description={me?.role}
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
                                <p className="font-semibold">{me?.role}</p>
                            </DropdownItem>
                            <DropdownItem
                                key="profile-settings"
                                color="default"
                                onClick={() => navigate({ to: '/profile' })}
                            >
                                Настройки
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger" onClick={logout}>
                                Выйти
                            </DropdownItem>
                            <DropdownItem onClick={() => setIsDarkMode(!isDarkMode)}>
                                <Switch
                                    isSelected={isDarkMode}
                                    size="lg"
                                    color="primary"
                                    onValueChange={setIsDarkMode}
                                    startContent={<MoonIcon />}
                                    endContent={<SunIcon />}
                                />
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className="grow"></div>
                {props.showLogo && (
                    <Image
                        draggable={false}
                        src="/logo.svg"
                        radius="none"
                        className="hidden h-8 invert dark:invert-0 md:block"
                    />
                )}

                <Button className="md:hidden" onClick={onOpen} isIconOnly variant="ghost">
                    <Icon icon="prime:bars" className="size-6" />
                </Button>

                <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" scrollBehavior="inside">
                    <ModalContent>
                        {(onClose) => (
                            <div onClick={onClose} className="-z-10 overflow-y-auto">
                                <MyNavigation />
                            </div>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    )
}

export default Topbar
