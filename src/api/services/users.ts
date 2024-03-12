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

export const UserMoneyTransactionScheme = z.object({
    title: z.string(),
    amount: z.number(),
    description: z.number(),
})
export type UserMoneyTransactionSchemeType = z.infer<typeof UserMoneyTransactionScheme>

export const UserMoneyScheme = z.object({
    balance: z.number(),
    history: UserMoneyTransactionScheme.array(),
})
export type UserMoneySchemeType = z.infer<typeof UserMoneyScheme>

export const getUsersMoney = async (id_user: string | number) => {
    const response = await privateAxios.post('/api/v1.0/users/money', {
        id_user: id_user.toString(),
    })
    const data = UserMoneyScheme.parse(response.data)
    return data
}

export const UserCarScheme = z.object({
    id: z.number(),
    name: z.string(),
    number: z.string(),
})
export type UserCarSchemeType = z.infer<typeof UserCarScheme>

export const ManyUserCarsScheme = z.object({
    cars: UserCarScheme.array(),
    total: z.number(),
})
export type ManyUserCarsScheme = z.infer<typeof ManyUserCarsScheme>

export const getUsersCars = async (config: { id_user: string | number; offset: number; limit: number }) => {
    const response = await privateAxios.post('/api/v1.0/orders/cars', {
        id_user: config.id_user.toString(),
        offset: config.offset,
        limit: config.limit,
    })
    const data = ManyUserCarsScheme.parse(response.data)
    return data
}

export const UserCarDetailsScheme = z.object({
    id: z.number(),
    name: z.string(),
    number: z.string(),
})
export type UserCarDetailsSchemeType = z.infer<typeof UserCarDetailsScheme>

export const getUsersCarDetails = async (config: { userID: number | string; carID: number | string }) => {
    const scheme = z.object({
        car: UserCarDetailsScheme,
    })
    const response = await privateAxios.get(`/api/v1.0/orders/car/${config.carID}`, {
        params: {
            id_user: config.userID.toString(),
        },
    })
    const data = scheme.parse(response.data)
    return data.car
}

export const SetUserCarScheme = z.object({
    id: z.number(),
    id_user: z.number(),
    name: z.string(),
    number: z.string(),
    id_type: z.number().optional().default(0),
})
export type SetUserCarSchemeType = z.input<typeof SetUserCarScheme>

export const setUserCar = async (vals: SetUserCarSchemeType) => {
    vals = SetUserCarScheme.parse(vals)
    const response = await privateAxios.put('/api/v1.0/orders/car', vals)
    return response
}

export const deleteUsersCar = async (userID: number, carID: string | number) => {
    const response = await privateAxios.delete(`/api/v1.0/orders/car/${carID}`, {
        data: {
            id_user: userID,
        },
    })
    return response
}

export const UserParkingScheme = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    address: z.string(),
    photo: z.string(),
    date: z.string().transform((s) => DateTime.fromISO(s)),
    isActive: z.boolean(),
})
export type UserParkingSchemeType = z.infer<typeof UserParkingScheme>

export const ManyUserParkingsScheme = z.object({
    parkings: UserParkingScheme.array(),
})
export type ManyUserParkingsScheme = z.infer<typeof ManyUserParkingsScheme>

export const getUsersParkings = async (userID: string | number) => {
    const response = await privateAxios.get('/api/v1.0/orders/parkings', {
        params: {
            id_user: userID,
        },
    })
    const data = ManyUserParkingsScheme.parse(response.data)
    return data
}
