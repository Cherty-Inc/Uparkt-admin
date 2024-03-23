import axios from 'axios'
import * as authService from '@api/services/auth'
import { router } from '@/router'

const baseURL = 'https://server.uparkt.ru'

export const publicAxios = axios.create({
    baseURL,
})

export const privateAxios = axios.create({
    baseURL,
})

privateAxios.interceptors.request.use(
    async (config) => {
        const userData = await authService.getUserData()
        if (userData?.accessToken) {
            config.headers['Authorization'] = 'Bearer '.concat(userData.accessToken)
        } else {
            await authService.resetUserData()
        }
        return config
    },
    (error) => Promise.reject(error),
)

privateAxios.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response) {
            if (err.response.status === 403 || err.response.status === 401) {
                await router.navigate({
                    to: '/login',
                })
            }
        }

        return Promise.reject(err)
    },
)

privateAxios.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error),
)

publicAxios.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(error),
)
