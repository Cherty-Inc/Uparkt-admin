import { createQueryKeys } from '@lukemorales/query-key-factory'

import * as chatsService from '@api/services/chats'

export const chats = createQueryKeys('chats', {
    one: (filters: { id: number }) => ({
        queryKey: [{ filters }],
        queryFn: () => chatsService.GetChat({ id: filters.id }),
    }),
    list: (filters: { search: string; page: number; itemsPerPage: number }) => ({
        queryKey: [{ filters }],
        queryFn: async () => {
            const chats = await chatsService.getAllChats({
                search: filters.search,
                limit: filters.itemsPerPage,
                offset: filters.itemsPerPage * (filters.page - 1),
            })
            chats.total = Math.ceil(chats.total / filters.itemsPerPage)
            return chats
        },
    }),
})
