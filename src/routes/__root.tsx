import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDarkMode } from 'usehooks-ts'
import { useFavicon } from '@/hooks'
import { useMetaThemeColor } from '@/hooks/dom'
import { Progress } from '@nextui-org/react'
import { useIsFetching } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createRootRoute({
    component: () => {
        const { isDarkMode } = useDarkMode()
        useMetaThemeColor(isDarkMode ? '#000000' : '#ffffff')
        const { setFavicon } = useFavicon()
        const fetchingQueriesCount = useIsFetching()

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
                    <AnimatePresence>
                        {fetchingQueriesCount > 0 && (
                            <motion.div
                                className="fixed inset-x-0 top-0 z-[9999]"
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                }}
                            >
                                <Progress isIndeterminate size="sm" radius="none" aria-label="Загрузка..." />
                            </motion.div>
                        )}
                    </AnimatePresence>
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
