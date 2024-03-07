import { Icon } from '@iconify/react'
import {
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Pagination,
    Spacer,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    User,
} from '@nextui-org/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState, type FC, Key, useCallback, useMemo, type ReactNode } from 'react'
import { useDebounceValue } from 'usehooks-ts'

import * as usersService from '@api/services/users'
import { toastError, toastSuccess } from '@/utils'
import Message from '@/components/message'

const Users: FC = () => {
    const [search, setSearch] = useDebounceValue('', 300)
    const [page, setPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const queryClient = useQueryClient()

    const { data, isFetching, isError, error } = useQuery({
        queryKey: ['users', { search, page, itemsPerPage }] as [
            string,
            { search: string; page: number; itemsPerPage: number },
        ],
        queryFn: async ({ queryKey }) => {
            const config = queryKey[1]
            const users = await usersService.getAllUsers({
                search: config.search,
                limit: config.itemsPerPage,
                offset: config.itemsPerPage * (config.page - 1),
                sort: 0,
                statuses: [],
            })
            users.total = Math.ceil(users.total / config.itemsPerPage)
            return users
        },
        placeholderData: (v) => v,
    })

    const { mutateAsync: banUserAsync } = useMutation({
        mutationFn: usersService.banUser,
        onSuccess: (_, id) => {
            toastSuccess(`Пользователь с ID ${id} заблокирован`)
            queryClient.invalidateQueries({
                queryKey: ['users'],
            })
        },
        onError: () => {
            toastError(`Ошибка`)
        },
    })

    const { mutateAsync: deleteUserAsync } = useMutation({
        mutationFn: usersService.deleteUser,
        onSuccess: (_, id) => {
            toastSuccess(`Пользователь с ID ${id} удалён`)
            queryClient.invalidateQueries({
                queryKey: ['users'],
            })
        },
        onError: () => {
            toastError(`Ошибка`)
        },
    })

    const cellRenderer = useCallback((v: usersService.UserSchemeType) => {
        return function cellRendererCallback(columnKey: Key) {
            const key = columnKey.toString() as keyof typeof v | 'user' | 'actions'

            let cellContent: ReactNode

            switch (key) {
                case 'user': {
                    let name = ''
                    if (v.name) name += v.name
                    if (v.surname) name += ' ' + v.surname
                    if (name === '') name = 'Без имени'
                    cellContent = (
                        <User
                            name={name}
                            avatarProps={{
                                src: v.photo_path ?? undefined,
                            }}
                            description={v.phone}
                        />
                    )
                    break
                }
                case 'datetime_create': {
                    cellContent = v.datetime_create.setLocale('ru-RU').toFormat('dd LLLL yyyy')
                    break
                }
                case 'role': {
                    cellContent = v.role.map((r) => (
                        <Chip key={r} variant="flat">
                            {r}
                        </Chip>
                    ))
                    break
                }
                case 'actions': {
                    cellContent = (
                        <div className="relative flex items-center justify-end gap-2">
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button isIconOnly size="sm" variant="light">
                                        <Icon icon="tabler:dots-vertical" className="size-6 text-default-400" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Действия">
                                    <DropdownItem
                                        aria-label="Забанить"
                                        color="warning"
                                        variant="flat"
                                        onClick={() => banUserAsync(v.id)}
                                    >
                                        Забанить
                                    </DropdownItem>
                                    <DropdownItem
                                        aria-label="Удалить"
                                        color="danger"
                                        variant="flat"
                                        onClick={() => deleteUserAsync(v.id)}
                                    >
                                        Удалить
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )
                    break
                }
                case 'status': {
                    const color =
                        {
                            Активен: 'success',
                            Заблокирован: 'danger',
                        }[v.status] || 'default'

                    cellContent = (
                        <Chip color={color as 'success'} variant="flat">
                            {v.status}
                        </Chip>
                    )
                    break
                }
                default: {
                    cellContent = v[key]?.toString() || 'Нет данных'
                    break
                }
            }

            return (
                <TableCell>
                    <div className="min-w-max">{cellContent}</div>
                </TableCell>
            )
        }
    }, [])

    const bottomContent = useMemo(
        () => (
            <div className="flex justify-center">
                <Pagination showControls total={data?.total || 0} initialPage={1} onChange={setPage}></Pagination>
            </div>
        ),
        [data?.total, setPage],
    )

    return (
        <>
            <h1 className="mb-4 mt-8 text-2xl font-semibold">Пользователи</h1>
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
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
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

            {isError ? (
                error.name === 'ZodError' ? (
                    <Message color="danger">Некорректные данные</Message>
                ) : (
                    <Message color="danger">Не удалось загрузить данные</Message>
                )
            ) : undefined}
            {isError && <Spacer x={0} y={4} />}

            <Table aria-label="Таблица пользователей" bottomContent={bottomContent} bottomContentPlacement="outside">
                <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="user">ПОЛЬЗОВАТЕЛЬ</TableColumn>
                    <TableColumn key="status">СТАТУС</TableColumn>
                    <TableColumn key="role">РОЛЬ</TableColumn>
                    <TableColumn key="datetime_create">СОЗДАН</TableColumn>
                    <TableColumn key="actions">ДЕЙСТВИЯ</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No rows to display.'} isLoading={isFetching} loadingContent={<Spinner />}>
                    {data?.users.map((v) => <TableRow key={`key-${v.id}`}>{cellRenderer(v)}</TableRow>) || []}
                </TableBody>
            </Table>
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard/users')({
    component: Users,
    beforeLoad: () => ({
        title: 'Пользователи',
    }),
})
