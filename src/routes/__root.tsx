import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDarkMode } from 'usehooks-ts'

export const Route = createRootRoute({
    component: () => {
        const { isDarkMode } = useDarkMode()

        useEffect(() => {
            if (isDarkMode) {
                document.body.classList.add('dark')
                document.body.classList.remove('light')
            } else {
                document.body.classList.add('light')
                document.body.classList.remove('dark')
            }
        })

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
