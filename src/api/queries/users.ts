import { createQueryKeys } from '@lukemorales/query-key-factory'
import * as usersService from '@api/services/users'

export const users = createQueryKeys('users', {
    list: (filters: { search: string; page: number; itemsPerPage: number; statusFilters: string[] }) => ({
        queryKey: [{ filters }],
        queryFn: async () => {
            const statuses: (boolean | null)[] = []

            filters.statusFilters.forEach((s) => {
                if (s === 'active') {
                    statuses.push(true)
                }
                if (s === 'blocked') {
                    statuses.push(false)
                }
                if (s === 'deleted') {
                    statuses.push(null)
                }
            })

            const users = await usersService.getAllUsers({
                search: filters.search,
                limit: filters.itemsPerPage,
                offset: filters.itemsPerPage * (filters.page - 1),
                statuses,
            })
            users.total = Math.ceil(users.total / filters.itemsPerPage)
            return users
        },
    }),
    one: (userID: string | number) => ({
        queryKey: [{ userID: userID.toString() }],
        queryFn: () => {
            return usersService.getUser(userID)
        },
        contextQueries: {
            money: {
                queryKey: null,
                queryFn: () => {
                    return usersService.getUsersMoney(userID)
                },
            },
            cars: {
                queryKey: null,
                contextQueries: {
                    list: (filters: { page: number; itemsPerPage: number }) => ({
                        queryKey: [{ filters }],
                        queryFn: async () => {
                            const users = await usersService.getUsersCars({
                                id_user: userID,
                                limit: filters.itemsPerPage,
                                offset: filters.itemsPerPage * (filters.page - 1),
                            })
                            users.total = Math.ceil(users.total / filters.itemsPerPage)
                            return users
                        },
                    }),
                    one: (carID: string | number) => ({
                        queryKey: [{ carID }],
                        queryFn: () => {
                            return usersService.getUsersCarDetails({ userID, carID })
                        },
                    }),
                },
            },
            parkings: {
                queryKey: null,
                queryFn: () => {
                    return usersService.getUsersParkings(userID)
                },
                contextQueries: {
                    one: (parkingID: string | number) => ({
                        queryKey: [{ parkingID }],
                        queryFn: () => usersService.getUsersParkingDetails(userID, parkingID),
                    }),
                },
            },
        },
    }),
})
