import { privateAxios } from '@/api/axios'
import { DateTime } from 'luxon'

export type UserStatus = string

export interface User {
    id: number
    name?: string
    surname?: string
    phone?: string
    datetime_create: DateTime
    role: string[]
    status: UserStatus
    photo_path?: string
}

export interface GetAllUsersData {
    users: User[]
    total: number
}

export const getAllUsers = async (config: {
    search: string
    sort: number
    offset: number
    limit: number
    statuses: UserStatus[]
}) => {
    interface SuccessResponse {
        status: true
        message: string
        users: {
            id: number
            name: string
            surname: string
            phone: string
            datetime_create: string
            role: string[]
            status: UserStatus
            photo_path: string
        }[]
        total: number
    }

    const response = await privateAxios.post<SuccessResponse>('/api/v1.0/admins/get_users', {
        search: config.search,
        sort: config.sort,
        offset: config.offset,
        limit: config.limit,
        statuses: config.statuses,
    })

    const data: GetAllUsersData = {
        ...response.data,
        users: response.data.users.map((v) => ({
            ...v,
            datetime_create: DateTime.fromFormat(v.datetime_create, 'dd.LL.yyyy'),
        })),
    }

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
