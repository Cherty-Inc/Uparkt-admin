import { ReactElement, type FC } from 'react'

import { MenuGroups } from '@/menu'
import { Button, Image } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { RoutePaths, RegisteredRouter, useMatchRoute, Link } from '@tanstack/react-router'

const MyLink: FC<{
    name: string
    path: RoutePaths<RegisteredRouter['routeTree']>
    icon: ReactElement
}> = ({ name, path, icon }) => {
    const matchRoute = useMatchRoute()

    const variant = matchRoute({ to: path }) === false ? 'flat' : 'shadow'

    return (
        <Button
            className="w-full justify-start"
            as={Link}
            to={path}
            key={path}
            color="primary"
            variant={variant}
            startContent={icon}
        >
            {name}
        </Button>
    )
}

const MyNavigation: FC = () => {
    return (
        <>
            <div className="flex flex-col items-center gap-8 p-4">
                <Image
                    draggable={false}
                    src="/logo.svg"
                    radius="none"
                    className="mx-auto w-2/3 py-8 invert dark:invert-0"
                />
                {MenuGroups.map((g) => (
                    <div className="w-full" key={g.name}>
                        <p className="mb-2 text-center text-sm font-semibold opacity-75">{g.name}</p>
                        <div className="flex flex-col items-stretch gap-3">
                            {g.items.map((i) => (
                                <MyLink
                                    icon={<Icon icon={i.icon} className="size-5" />}
                                    name={i.name}
                                    path={i.path}
                                    key={i.path}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default MyNavigation
