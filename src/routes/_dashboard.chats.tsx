import { Icon } from '@iconify/react'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pagination,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
} from '@nextui-org/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FC, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { useDarkMode, useDebounceValue } from 'usehooks-ts'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import * as chatsService from '@api/services/chats'
import { queries } from '@/api/queries'

import { DateTime } from 'luxon'

import EmojiMartData from '@emoji-mart/data'
import EmojiMart from '@emoji-mart/react'
import EmojiMartI18N from '@emoji-mart/data/i18n/ru.json'

import _LinesEllipsis from 'react-lines-ellipsis'
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'
import { authenticated } from '@/router'
import { queryClient } from '@/main'
import { z } from 'zod'

const LinesEllipsis = responsiveHOC()(_LinesEllipsis)

const Chat: FC<{
    id_chat: number
    username: string
    photo_path?: string
    msg?: string
    time?: DateTime
}> = ({ id_chat, username, photo_path, msg, time }) => {
    const queryClient = useQueryClient()
    const { isDarkMode } = useDarkMode()
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [message, setMessage] = useState('')
    const dummyBottomEl = useRef<HTMLDivElement | null>(null)
    const [sessionMessages, setSessionMessages] = useState<
        {
            msg: string
            isMe: boolean
            timestamp_send: DateTime
        }[]
    >([])

    const { data, isLoading, isSuccess } = useQuery({
        ...queries.chats.one({ id: id_chat }),
        enabled: isChatOpen,
        select: (data) =>
            ({
                ...data,
                last_messages: data.last_messages.slice().reverse(),
            }) satisfies chatsService.ChatSchemeType,
    })

    const { data: me } = useQuery(queries.me.detail)

    const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocket<{
        id_chat: number
        msg: string
        msg_type: number
        timestamp_send: number
        id_sender: number
    }>(
        'wss://server.uparkt.ru/api/v1.0/chats/' + (me?.token || ''),
        {
            share: true,
        },
        isChatOpen,
    )

    useEffect(() => {
        if (lastJsonMessage) {
            setSessionMessages((messages) => [
                ...messages,
                {
                    isMe: lastJsonMessage.id_sender === me?.id,
                    msg: lastJsonMessage.msg,
                    timestamp_send: DateTime.fromMillis(lastJsonMessage.timestamp_send),
                },
            ])
        }
    }, [lastJsonMessage])

    useLayoutEffect(() => {
        if (isChatOpen) {
            dummyBottomEl.current?.scrollIntoView({
                behavior: 'smooth',
            })
        }
    }, [sessionMessages, dummyBottomEl, isChatOpen, data])

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Подключение...',
        [ReadyState.OPEN]: 'Подключен',
        [ReadyState.CLOSING]: 'Отключение',
        [ReadyState.CLOSED]: 'Отключен',
        [ReadyState.UNINSTANTIATED]: 'Не создан',
    }[readyState]

    const inputEndContent = useMemo(
        () => (
            <Popover placement="top">
                <PopoverTrigger>
                    <Button isIconOnly variant="light" size="lg" isDisabled={readyState !== ReadyState.OPEN}>
                        <Icon icon="tabler:mood-happy-filled" className="size-6 text-foreground-600" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <EmojiMart
                        data={EmojiMartData}
                        locale="ru"
                        theme={isDarkMode ? 'dark' : 'light'}
                        i18n={EmojiMartI18N}
                        skinTonePosition="none"
                        previewPosition="none"
                        onEmojiSelect={(e: any) => setMessage((v) => v.concat(e.native))}
                    />
                </PopoverContent>
            </Popover>
        ),
        [isDarkMode, readyState],
    )

    const sendChatMessage = () => {
        if (message) {
            sendJsonMessage({
                id_chat: id_chat,
                msg: message,
                msgType: 0,
            })
            setMessage('')
        }
    }

    return (
        <>
            <Card className="rounded-2xl" isPressable key={id_chat} onClick={() => setIsChatOpen(true)}>
                <CardBody className="flex flex-row items-center gap-4 p-4">
                    <Avatar
                        src={photo_path}
                        fallback={<Icon icon="tabler:user-filled" className="size-6" />}
                        radius="full"
                        isBordered
                        className="size-14 shrink-0"
                    />
                    <div className="flex min-w-0 shrink grow flex-col items-stretch gap-1">
                        <div>{username}</div>
                        {msg != null && (
                            <div className="text-sm text-foreground-600">
                                <LinesEllipsis text={msg} maxLine={1} ellipsis="..." trimRight basedOn="letters" />
                            </div>
                        )}
                    </div>
                    {time != null && (
                        <div className="flex items-end self-stretch">
                            <span className="text-sm text-foreground-400">{time.toFormat('HH:mm')}</span>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal
                isOpen={isChatOpen}
                onClose={() =>
                    queryClient.invalidateQueries({
                        queryKey: queries.chats._def,
                    })
                }
                onOpenChange={setIsChatOpen}
                backdrop="blur"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex items-center gap-4 p-5">
                                <Avatar
                                    src={photo_path}
                                    fallback={<Icon icon="tabler:user-filled" className="size-6" />}
                                    isBordered
                                    radius="full"
                                    className="size-14"
                                />
                                <div className="flex grow items-end justify-between gap-4">
                                    <span>{username}</span>
                                    <span
                                        className={[
                                            'text-xs',
                                            readyState === ReadyState.OPEN && 'text-green-400',
                                            readyState === ReadyState.CONNECTING && 'text-orange-400',
                                            readyState === ReadyState.CLOSED && 'text-red-400',
                                        ].join(' ')}
                                    >
                                        {connectionStatus}
                                    </span>
                                </div>
                            </ModalHeader>
                            <ModalBody className="min-h-64 border-y border-foreground-100 px-5 py-0">
                                {isLoading && (
                                    <div className="flex h-64 items-center justify-center">
                                        <Spinner />
                                    </div>
                                )}
                                {isSuccess && (
                                    <div className="flex flex-col gap-2 py-5">
                                        {data?.last_messages.map((m) => (
                                            <div
                                                className={[
                                                    'w-fit max-w-[80%] rounded-xl px-3 py-2',
                                                    !m.isMe && 'self-start bg-foreground-100',
                                                    m.isMe && 'self-end bg-foreground-200',
                                                ].join(' ')}
                                                key={m.timestamp_send.toMillis()}
                                            >
                                                <p className="mb-1 hyphens-auto break-words">{m.msg}</p>
                                                <p className="ml-4 text-end text-xs text-foreground-500">
                                                    {m.timestamp_send.toFormat('HH:mm')}
                                                </p>
                                            </div>
                                        ))}

                                        {sessionMessages.map((m) => (
                                            <div
                                                className={[
                                                    'w-fit max-w-[48%] rounded-xl px-3 py-2',
                                                    !m.isMe && 'self-start bg-foreground-100',
                                                    m.isMe && 'self-end bg-foreground-200',
                                                ].join(' ')}
                                                key={m.timestamp_send.toMillis()}
                                            >
                                                <p className="mb-1 hyphens-auto break-words">{m.msg}</p>
                                                <p className="ml-4 text-end text-xs text-foreground-500">
                                                    {m.timestamp_send.toFormat('HH:mm')}
                                                </p>
                                            </div>
                                        ))}

                                        <div ref={dummyBottomEl}></div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="flex items-center gap-2 p-5">
                                <Input
                                    size="sm"
                                    value={message}
                                    radius="lg"
                                    isDisabled={readyState !== ReadyState.OPEN}
                                    onValueChange={setMessage}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') sendChatMessage()
                                    }}
                                />
                                {inputEndContent}
                                <Button
                                    isDisabled={readyState !== ReadyState.OPEN}
                                    isIconOnly
                                    size="lg"
                                    variant="light"
                                    color="primary"
                                    radius="lg"
                                    onClick={sendChatMessage}
                                >
                                    <Icon icon="tabler:send" className="size-6" />
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

const Users: FC = () => {
    const [search, setSearch] = useDebounceValue('', 300)
    const navigate = useNavigate()
    const { page, pageSize: itemsPerPage } = Route.useSearch()
    const setItemsPerPage = useCallback((pageSize: number) => {
        navigate({
            to: '/chats/',
            search: {
                pageSize,
                page: 1,
            },
        })
    }, [])
    const setPage = useCallback(
        (page: number) => {
            navigate({
                to: '/chats/',
                search: {
                    page,
                    pageSize: itemsPerPage,
                },
            })
        },
        [itemsPerPage],
    )

    const queryClient = useQueryClient()

    const { data, isFetching } = useQuery({
        ...queries.chats.list({ search, page, itemsPerPage }),
        placeholderData: (v) => v,
    })

    return (
        <>
            <h1 className="mb-4 mt-8 text-2xl font-semibold">Чаты</h1>
            <div className="flex items-center justify-between gap-x-4 gap-y-3">
                <Input
                    className="shrink grow transition-all focus-within:grow md:w-72 md:grow-0"
                    placeholder="Поиск"
                    defaultValue=""
                    onValueChange={setSearch}
                    variant="flat"
                    size="sm"
                    radius="md"
                    endContent={<Icon icon="tabler:search" />}
                />
                <Button
                    isIconOnly
                    variant="flat"
                    size="lg"
                    isDisabled={isFetching}
                    onClick={() => queryClient.invalidateQueries({ queryKey: queries.chats._def })}
                >
                    <Icon icon="tabler:refresh" className="size-4" />
                </Button>
            </div>

            <div className="flex justify-end">
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Button variant="light" size="sm" disableRipple className="!bg-transparent">
                            Элементов на страницу: {itemsPerPage}
                            <Icon icon="tabler:chevron-down" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Количество элементов на странице"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={[itemsPerPage.toString()]}
                        onSelectionChange={(keys: any) => setItemsPerPage(Number(keys.currentKey))}
                    >
                        <DropdownItem key="5">5</DropdownItem>
                        <DropdownItem key="10">10</DropdownItem>
                        <DropdownItem key="20">20</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="flex flex-col items-stretch gap-4">
                {data?.chats.map((c) => (
                    <Chat
                        id_chat={c.id_chat}
                        username={c.username}
                        msg={c.message?.msg}
                        photo_path={c.photo_path ?? undefined}
                        time={c.message?.time}
                        key={c.id_chat}
                    />
                ))}
            </div>

            <div className="mt-4 flex justify-center">
                <Pagination showControls total={data?.total || 0} page={page} onChange={setPage}></Pagination>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_dashboard/chats')({
    component: Users,
    validateSearch: z.object({
        page: z
            .number()
            .optional()
            .transform((page) => Math.max(0, page ?? 1)),
        pageSize: z
            .number()
            .optional()
            .transform((size) => Math.max(0, Math.min(size ?? 10, 20))),
    }),
    beforeLoad: () =>
        authenticated(async () => {
            await queryClient.fetchQuery(queries.me.detail)
            return {
                title: 'Чаты',
            }
        }),
})
