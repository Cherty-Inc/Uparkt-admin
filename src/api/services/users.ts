import { privateAxios } from '@/api/axios'
import { DateTime } from 'luxon'
import { z } from 'zod'

export const UserStatusScheme = z.string().min(1)
export type UserStatusSchemeType = z.infer<typeof UserStatusScheme>

export const UserScheme = z.object({
    id: z.number(),
    name: z.string().nullable(),
    surname: z.string().nullable(),
    phone: z.string().nullable(),
    datetime_create: z.string().transform((s) => DateTime.fromFormat(s, 'dd.LL.yyyy')),
    role: z.string().array().min(1),
    status: UserStatusScheme,
    photo_path: z.string().nullish(),
})
export type UserSchemeType = z.infer<typeof UserScheme>

export const ManyUsersScheme = z.object({
    users: UserScheme.array(),
    total: z.number(),
})
export type ManyUsersSchemeType = z.infer<typeof ManyUsersScheme>

export const UserDetailsScheme = z.object({
    id: z.number(),
    token: z.string().min(1),
    name: z.string().nullable(),
    surname: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string().array(),
    date_reg: z.string().transform((s) => DateTime.fromISO(s)),
    photo_path: z.string().optional(),
    balance: z.number(),
})
export type MeSchemeType = z.infer<typeof UserDetailsScheme>

export const getUser = async (userID: string | number) => {
    const scheme = z.object({
        me: UserDetailsScheme,
    })
    const response = await privateAxios.get('/api/v1.0/users/get_me', {
        params: {
            id_user: userID,
        },
    })
    const data = scheme.parse(response.data).me
    return data
}

export const getAllUsers = async (config: {
    search: string
    sort: number
    offset: number
    limit: number
    statuses: UserStatusSchemeType[]
}) => {
    const response = await privateAxios.post('/api/v1.0/admins/get_users', {
        search: config.search,
        sort: config.sort,
        offset: config.offset,
        limit: config.limit,
        statuses: config.statuses,
    })
    const data = ManyUsersScheme.parse(response.data)

    return data
}

export const banUser = async (id: number) => {
    const response = await privateAxios.post('/api/v1.0/admins/ban_user', {
        id: id,
    })
    return response.data
}

export const deleteUser = async (id: number) => {
    const response = await privateAxios.post('/api/v1.0/admins/delete_user', {
        id: id,
    })
    return response.data
}
