import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDarkMode } from 'usehooks-ts'
import { useFavicon } from '@/hooks'
import { useMetaThemeColor } from '@/hooks/dom'

export const Route = createRootRoute({
    component: () => {
        const { isDarkMode } = useDarkMode()
        useMetaThemeColor(isDarkMode ? '#000000' : '#ffffff')
        const { setFavicon } = useFavicon()

        useLayoutEffect(() => {
            if (isDarkMode) {
                console.log('set dark mode', { isDarkMode })
                document.documentElement.classList.add('dark')
                document.documentElement.classList.remove('light')
                setFavicon('/favicon-dark.svg')
            } else {
                console.log('set light mode', { isDarkMode })
                document.documentElement.classList.add('light')
                document.documentElement.classList.remove('dark')
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
    beforeLoad: () => ({
        title: '',
    }),
})
