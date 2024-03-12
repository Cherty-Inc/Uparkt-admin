import { createQueryKeys } from '@lukemorales/query-key-factory'
import * as usersService from '@api/services/users'

export const users = createQueryKeys('users', {
    list: (filters: { search: string; page: number; itemsPerPage: number }) => ({
        queryKey: [{ filters }],
        queryFn: async () => {
            const users = await usersService.getAllUsers({
                search: filters.search,
                limit: filters.itemsPerPage,
                offset: filters.itemsPerPage * (filters.page - 1),
                sort: 0,
                statuses: [],
            })
            users.total = Math.ceil(users.total / filters.itemsPerPage)
            return users
        },
    }),
    user: (userID: string | number) => ({
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
            cars: (filters: { page: number; itemsPerPage: number }) => ({
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
            parkings: {
                queryKey: null,
                queryFn: () => {
                    return usersService.getUsersParkings(userID)
                },
            },
        },
    }),
})
