import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

const config = defineConfig({
    plugins: [react(), TanStackRouterVite()],
    server: {
        port: 9999,
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
