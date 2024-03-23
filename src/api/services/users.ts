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
    offset: number
    limit: number
    statuses: (boolean | null)[]
}) => {
    const response = await privateAxios.post('/api/v1.0/admins/get_users', {
        search: config.search,
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
    amount: z.string(),
    description: z.string().nullable(),
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

export const UserParkingDetailsScheme = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    address: z.object({
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
    }),
    from_date: z.string().transform((s) => DateTime.fromFormat(s, 'dd.MM.yyyy').toISO()),
    to_date: z.string().transform((s) => DateTime.fromFormat(s, 'dd.MM.yyyy').toISO()),
    price: z.number(),
    quantity: z.number(),
    photos: z
        .string()
        .transform((s) => ({ src: s }))
        .array(),
    services: z.number().array(),
})
export type UserParkingDetailsSchemeType = z.infer<typeof UserParkingDetailsScheme>

export const getUsersParkingDetails = async (userID: string | number, parkingID: string | number) => {
    const scheme = z.object({
        parking: UserParkingDetailsScheme,
    })
    const response = await privateAxios.get(`/api/v1.0/orders/parking/${parkingID}`, {
        params: {
            id_user: userID,
        },
    })
    const data = scheme.parse(response.data)
    return data.parking
}

export const deleteUsersParking = async (userID: string | number, parkingID: number | string) => {
    const response = await privateAxios.delete(`/api/v1.0/orders/parking/${parkingID}`, {
        params: {
            id_user: userID,
        },
    })
    return response
}

export const SetUserParkingScheme = z.object({
    id_parking: z.number(),
    id_user: z.number(),
    name: z.string(),
    description: z.string(),
    information: z.object({
        address: z.object({
            address: z.string(),
            latitude: z.number().transform((n) => n.toString()),
            longitude: z.number().transform((n) => n.toString()),
        }),
        from_date: z.string().transform((s) => {
            const iso = DateTime.fromISO(s)
            return `${iso.day}.${iso.month}.${iso.year}`
        }),
        to_date: z.string().transform((s) => {
            const iso = DateTime.fromISO(s)
            return `${iso.day}.${iso.month}.${iso.year}`
        }),
    }),
    price: z.number(),
    quantity: z.number(),
    photos: z.string().array(),
    services: z.object({
        services: z.number().array(),
    }),
})
export type SetUserParkingSchemeType = z.input<typeof SetUserParkingScheme>

export const setUserParking = async (vals: SetUserParkingSchemeType) => {
    const data = SetUserParkingScheme.parse(vals)
    console.log(data)
    const response = await privateAxios.put('/api/v1.0/orders/parking', data)
    return response
}
