import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react'
import { useMatches, useNavigate, useRouterState } from '@tanstack/react-router'
import { FC, useMemo } from 'react'

const MyBreadcrumbs: FC = () => {
    const matches = useMatches()
    const breadcrumbs = useMemo(() => {
        return matches
            .filter((m) => m.context.title)
            .map((m) => ({
                title: m.context.title,
                pathname: m.pathname,
            }))
    }, [matches])
    const navigate = useNavigate()
    const routerState = useRouterState()

    return (
        <Breadcrumbs
            onAction={(key) =>
                navigate({
                    to: key.toString(),
                } as any)
            }
        >
            {breadcrumbs.map((b) => (
                <BreadcrumbItem
                    key={b.pathname}
                    isCurrent={b.pathname.replace(/\/$/, '') === routerState.location.pathname.replace(/\/$/, '')}
                >
                    {b.title}
                </BreadcrumbItem>
            ))}
        </Breadcrumbs>
    )
}

export default MyBreadcrumbs
