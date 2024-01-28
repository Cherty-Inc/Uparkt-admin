import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDarkMode } from 'usehooks-ts'
import { useFavicon } from '@/hooks'

export const Route = createRootRoute({
    component: () => {
        const { isDarkMode } = useDarkMode()
        const { setFavicon } = useFavicon()

        useLayoutEffect(() => {
            if (isDarkMode) {
                console.log('set dark mode', { isDarkMode })
                document.body.classList.add('dark')
                setFavicon('/favicon-dark.svg')
            } else {
                console.log('set light mode', { isDarkMode })
                document.body.classList.remove('dark')
                setFavicon('/favicon-light.svg')
            }
        }, [isDarkMode])

        return (
            <>
                <div className="min-h-dvh">
                    <Toaster />
                    <Outlet />
                </div>
            </>
        )
    },
})
