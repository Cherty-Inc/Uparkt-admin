import type { RoutePaths, RegisteredRouter } from '@tanstack/react-router'

interface MenuItem {
    name: string
    path: RoutePaths<RegisteredRouter['routeTree']>
    icon: string
}

interface MenuGroup {
    name: string
    items: MenuItem[]
}

export const MenuGroups: MenuGroup[] = [
    {
        name: 'Общее',
        items: [
            {
                name: 'Дом',
                path: '/',
                icon: 'tabler:home',
            },
            {
                name: 'Пример',
                path: '/example',
                icon: 'tabler:ad-filled',
            },
        ],
    },
]
