import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDarkMode } from 'usehooks-ts'
import { useFavicon } from '@/hooks'

export const Route = createRootRoute({
    component: () => {
        const { isDarkMode } = useDarkMode()
        const { setFavicon } = useFavicon()

        useEffect(() => {
            if (isDarkMode) {
                document.body.classList.add('dark')
                document.body.classList.remove('light')
                setFavicon('/favicon-dark.svg')
            } else {
                document.body.classList.add('light')
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
