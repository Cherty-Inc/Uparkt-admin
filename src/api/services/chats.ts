import { DateTime } from 'luxon'
import { privateAxios } from '@api/axios'
import { z } from 'zod'

export const ShortChatSchema = z.object({
    id_chat: z.number(),
    username: z.string().transform((s) => (s === '' ? 'Без имени' : s)),
    photo_path: z.string().nullish(),
    message: z
        .object({
            msg: z.string(),
            time: z.number().transform((s) => DateTime.fromMillis(s)),
        })
        .nullable(),
})
export type ShortChatSchemaType = z.infer<typeof ShortChatSchema>

export const ManyShortChatsSchema = z.object({
    chats: ShortChatSchema.array(),
    total: z.number(),
})
export type ManyShortChatsSchemaType = z.infer<typeof ManyShortChatsSchema>

export const getAllChats = async (config: { offset: number; limit: number; search: string }) => {
    const response = await privateAxios.post('/api/v1.0/chats/get_chats', {
        offset: config.offset,
        limit: config.limit,
        search: config.search,
    })
    const data = ManyShortChatsSchema.parse(response.data)
    return data
}

export const ChatScheme = z.object({
    id: z.number(),
    reg_date: z.string().transform((s) => DateTime.fromISO(s)),
    last_messages: z
        .object({
            msg: z.string(),
            msgType: z.number(),
            timestamp_send: z.number().transform((t) => DateTime.fromMillis(t)),
            isMe: z.boolean(),
        })
        .array(),
})
export type ChatSchemeType = z.infer<typeof ChatScheme>

export const GetChat = async (config: { id: number }) => {
    const scheme = z.object({
        chat: ChatScheme,
    })
    const response = await privateAxios.post('/api/v1.0/chats/get_chat', {
        id: config.id,
    })
    const data = scheme.parse(response.data)
    return data.chat
}

export const ChatMessagesScheme = z.object({
    id_chat: z.number(),
    messages: z
        .object({
            msg: z.string(),
            msgType: z.number(),
            timestamp_send: z.number().transform((t) => DateTime.fromMillis(t)),
            id_sender: z.number(),
        })
        .array(),
    total: z.number(),
})
export type ChatMessagesSchemeType = z.infer<typeof ChatMessagesScheme>

export const getMessages = async (config: { offset: number; limit: number; id_chat: number }) => {
    const response = await privateAxios.post('/api/v1.0/chats/get_messages', {
        id_chat: config.id_chat,
        offset: config.offset,
        limit: config.limit,
    })

    const data = ChatMessagesScheme.parse(response.data)

    return data
}
