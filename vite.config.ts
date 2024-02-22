import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const plugins = [
    react(),
    TanStackRouterVite(),
    sentryVitePlugin({
        org: 'itu-inc',
        project: 'uparkt-admin',
        authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
]

const config = defineConfig({
    plugins,
    server: {
        port: 9999,
    },
    preview: {
        port: 9999,
    },
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/'),
            '@components': path.resolve(__dirname, './src/components/'),
            '@api': path.resolve(__dirname, './src/api/'),
        },
    },
})

export default config
