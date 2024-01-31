import { DateTime } from 'luxon'
import { privateAxios } from '@api/axios'

export interface ShortChat {
    id_chat: number
    username: string
    photo_path?: string
    message?: {
        msg: string
        time: DateTime
    }
}

export interface GetAllChatsData {
    status: boolean
    message: string
    chats: ShortChat[]
    total: number
}

export const getAllChats = async (config: { offset: number; limit: number; search: string }) => {
    interface SuccessResponse {
        status: boolean
        message: string
        chats: {
            id_chat: number
            username: string
            photo_path?: string
            message?: {
                msg: string
                time: number
            }
        }[]
        total: number
    }

    const response = await privateAxios.post<SuccessResponse>('/api/v1.0/chats/get_chats', {
        offset: config.offset,
        limit: config.limit,
        search: config.search,
    })

    const chats: ShortChat[] = response.data.chats.map((c) => {
        return {
            ...c,
            message: c.message
                ? {
                      msg: c.message.msg,
                      time: DateTime.fromMillis(c.message.time),
                  }
                : undefined,
        }
    })
    const data: GetAllChatsData = {
        ...response.data,
        chats,
    }

    return data
}

export interface GetChatData {
    status: boolean
    message: string
    chat: {
        id: number
        reg_date: DateTime
        last_messages: {
            msg: string
            msgType: number
            timestamp_send: DateTime
            isMe: boolean
        }[]
    }
}

export const GetChat = async (config: { id: number }) => {
    interface SuccessResponse {
        status: boolean
        message: string
        chat: {
            id: number
            reg_date: string
            last_messages: {
                msg: string
                msgType: number
                timestamp_send: number
                isMe: boolean
            }[]
        }
    }

    const response = await privateAxios.post<SuccessResponse>('/api/v1.0/chats/get_chat', {
        id: config.id,
    })

    const data: GetChatData = {
        ...response.data,
        chat: {
            ...response.data.chat,
            reg_date: DateTime.fromISO(response.data.chat.reg_date),
            last_messages: response.data.chat.last_messages.map((m) => ({
                ...m,
                timestamp_send: DateTime.fromMillis(m.timestamp_send),
            })),
        },
    }

    return data
}

export interface GetMessagesData {
    status: boolean
    message: string
    id_chat: number
    messages: {
        msg: string
        msgType: number
        timestamp_send: DateTime
        isMe: boolean
    }[]
    total: number
}
export const getMessages = async (config: { offset: number; limit: number; id_chat: number }) => {
    interface SuccessResponse {
        status: boolean
        message: string
        id_chat: number
        messages: {
            msg: string
            msgType: number
            timestamp_send: number
            isMe: boolean
        }[]
        total: number
    }

    const response = await privateAxios.post<SuccessResponse>('/api/v1.0/chats/get_messages', {
        id_chat: config.id_chat,
        offset: config.offset,
        limit: config.limit,
    })

    const data: GetMessagesData = {
        ...response.data,
        messages: response.data.messages.map((m) => ({
            ...m,
            timestamp_send: DateTime.fromMillis(m.timestamp_send),
        })),
    }

    return data
}
