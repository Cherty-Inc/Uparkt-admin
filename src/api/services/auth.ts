import localforage from 'localforage'
import { privateAxios, publicAxios } from '@api/axios'
import { md5 } from 'js-md5'
import { DateTime } from 'luxon'
import { z } from 'zod'

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

export const isAuthenticated = async () => {
    const userData = await getUserData()
    if (!userData) {
        return false
    }
    try {
        await privateAxios.get('/api/v1.0/users/get_me', {
            params: {
                intention: 'check_auth',
            },
        })
        return true
    } catch {
        return false
    }
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
    } else {
        throw new Error('Не удалось залогиниться, ' + JSON.stringify(response.data))
    }

    const me = await getMe()
    if (!me.role.includes('Администратор')) {
        await logout()
        throw new Error('Не удалось залогиниться, недостаточно прав')
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

export const MeScheme = z.object({
    id: z.number(),
    token: z.string().min(1),
    name: z.string().nullable(),
    surname: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string().array(),
    date_reg: z.string().transform((s) => DateTime.fromISO(s)),
})
export type MeSchemeType = z.infer<typeof MeScheme>

export const getMe = async () => {
    const scheme = z.object({
        me: MeScheme,
    })
    const response = await privateAxios.get('/api/v1.0/users/get_me')
    const data = scheme.parse(response.data).me
    return data
}

export const SetMeScheme = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
})
export type SetMeSchemeType = z.infer<typeof SetMeScheme>
export const setMe = (vals: SetMeSchemeType) => {
    vals = SetMeScheme.parse(vals)
    return privateAxios.put('/api/v1.0/users/update_me', vals)
}

export const ChangePasswordScheme = z.object({
    last_password: z.string().min(1),
    password: z.string().min(1),
})
export type ChangePasswordSchemeType = z.infer<typeof ChangePasswordScheme>
export const changePassword = (vals: ChangePasswordSchemeType) => {
    vals = ChangePasswordScheme.parse(vals)
    return privateAxios.put('/api/v1.0/users/update_me', vals)
}
