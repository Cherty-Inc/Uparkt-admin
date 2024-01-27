import localforage from 'localforage'
import { privateAxios, publicAxios } from '@api/axios'

let tokenRevalidationIntervalID: ReturnType<typeof setInterval> | undefined

export interface TUserData {
    accessToken: string | null
}
export const resetUserData = async () => {
    await localforage.setItem('user_data', null)
}
export const saveUserData = async (data: TUserData) => {
    await localforage.setItem<TUserData>('user_data', data)
}
export const getUserData = async () => {
    return await localforage.getItem<TUserData>('user_data')
}

export const startRevalidationProccess = () => {
    if (tokenRevalidationIntervalID) {
        clearInterval(tokenRevalidationIntervalID)
    }
    tokenRevalidationIntervalID = setInterval(revalidateToken, 14 * 60 * 1000)
}

export const stopRevalidationProccess = () => {
    clearInterval(tokenRevalidationIntervalID)
    tokenRevalidationIntervalID = undefined
}

export const revalidateToken = async () => {
    interface SuccessResponse {
        status: true
        token: string
        message: string
    }

    try {
        const response = await privateAxios.post<SuccessResponse>('/api/v1.0/auth/reload_access')

        saveUserData({
            accessToken: response.data.token,
        })
    } catch (exception) {
        logout()
        throw exception
    }
}

export const login = async (vars: { login: string; password: string; fbid?: string }) => {
    interface SuccessResponse {
        status: true
        token: string
        message: string
    }

    interface BadResponse {
        status: false
        message: string
    }

    const response = await publicAxios.post<SuccessResponse | BadResponse>('/api/v1.0/auth/login', {
        login: vars.login,
        password: vars.password,
        fbid: vars.fbid,
    })

    if (response.data.status) {
        await saveUserData({ accessToken: response.data.token })
        startRevalidationProccess()
    } else {
        console.error('Не удалось залогиниться', response.data)
        stopRevalidationProccess()
    }
}

export const logout = async () => {
    interface SuccessResponse {
        status: true
        message: string
    }

    stopRevalidationProccess()
    resetUserData()
    await privateAxios.post<SuccessResponse>('/api/v1.0/auth/logout')
}
