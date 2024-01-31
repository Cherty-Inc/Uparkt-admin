import localforage from 'localforage'
import { privateAxios, publicAxios } from '@api/axios'
import { md5 } from 'js-md5'
import { DateTime } from 'luxon'

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

export const startRevalidationProccess = async () => {
    console.log('starting revalidation process')
    if (tokenRevalidationIntervalID) {
        console.log('found old token revalidation interval id - clearing')
        clearInterval(tokenRevalidationIntervalID)
    }
    const userData = await getUserData()
    if (userData?.accessToken) {
        try {
            console.log('attempt to revalidate already existed token')
            await revalidateToken()
        } catch {
            console.log('already existed token revalidation failed - logout')
            return
        }
        tokenRevalidationIntervalID = setInterval(revalidateToken, 12 * 60 * 60 * 1000)
        console.log('started revalidation process')
    } else {
        console.log('access token not found locally - revalidation proccess not started')
    }
}

export const stopRevalidationProccess = () => {
    console.log('stopping revalidation proccess')
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
        password: md5(vars.password),
        fbid: vars.fbid,
    })

    if (response.data.status) {
        await saveUserData({ accessToken: response.data.token })
        await startRevalidationProccess()
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

    const userData = await getUserData()
    if (userData?.accessToken) {
        try {
            await privateAxios.post<SuccessResponse>('/api/v1.0/auth/logout')
        } catch {
            console.log('access token is too old. POST /api/v1.0/auth/logout request failed')
        }
    }
    stopRevalidationProccess()
    resetUserData()
}

export interface GetMeData {
    status: true
    message: 'Success!'
    me: {
        id: number
        token: string
        surname: string
        name: string
        phone: string
        email: string
        role: string[]
        date_reg: DateTime
    }
}
export const getMe = async () => {
    interface SuccessResponse {
        status: true
        message: 'Success!'
        me: {
            id: number
            token: string
            surname: string
            name: string
            phone: string
            email: string
            role: string[]
            date_reg: string
        }
    }

    const response = await privateAxios.get<SuccessResponse>('/api/v1.0/users/get_me')

    const data: GetMeData = {
        ...response.data,
        me: {
            ...response.data.me,
            date_reg: DateTime.fromISO(response.data.me.date_reg),
        },
    }

    return data
}
