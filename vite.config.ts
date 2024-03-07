import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

const plugins = [react(), TanStackRouterVite()]

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
