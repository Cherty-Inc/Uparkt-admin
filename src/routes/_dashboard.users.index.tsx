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
    Selection,
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
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type FC, Key, useCallback, useMemo, type ReactNode, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'

import * as usersService from '@api/services/users'
import { queries } from '@api/queries'
import { toastError, toastSuccess } from '@/utils'
import Message from '@/components/message'
import { authenticated } from '@/router'
import { queryClient } from '@/main'
import { z } from 'zod'

const Users: FC = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [search, setSearch] = useDebounceValue('', 300)
    const { page, pageSize: itemsPerPage } = Route.useSearch()
    const setItemsPerPage = useCallback((pageSize: number) => {
        navigate({
            to: '/users/',
            search: {
                pageSize,
                page: 1,
            },
        })
    }, [])
    const setPage = useCallback(
        (page: number) => {
            navigate({
                to: '/users/',
                search: {
                    page,
                    pageSize: itemsPerPage,
                },
            })
        },
        [itemsPerPage],
    )

    const [statusFilters, setStatusFilters] = useState<Selection>(() => new Set([]))
    const statusFiltersCount = useMemo(() => {
        if (statusFilters === 'all') {
            return -1
        }
        return statusFilters.size
    }, [statusFilters])

    const { data, isFetching, isError, error } = useQuery({
        ...queries.users.list({
            search,
            page,
            itemsPerPage,
            statusFilters: useMemo(() => {
                if (statusFilters === 'all') {
                    return []
                } else {
                    return Array.from(statusFilters) as string[]
                }
            }, [statusFilters]),
        }),
        placeholderData: (v) => v,
    })

    const { mutateAsync: banUserAsync } = useMutation({
        mutationFn: (vals: { id: number; status: string }) => usersService.banUser(vals.id),
        onSuccess: (_, vals) => {
            const actionPerformed = vals.status === 'Активен' ? 'заблокирован' : 'разблокирован'
            toastSuccess(`Пользователь с ID ${vals.id} ${actionPerformed}`)
            queryClient.invalidateQueries({
                queryKey: queries.users._def,
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
                queryKey: queries.users._def,
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
                    const actions = []
                    if (v.status === 'Активен') {
                        actions.push({
                            label: 'Подробно',
                            color: 'default' as const,
                            onClick: () =>
                                navigate({
                                    to: '/users/$user_id',
                                    params: {
                                        user_id: v.id.toString(),
                                    },
                                }),
                        })
                    }
                    if (['Заблокирован', 'Активен'].find((s) => v.status === s)) {
                        actions.push({
                            label: v.status === 'Заблокирован' ? 'Разблокировать' : 'Заблокировать',
                            color: 'warning' as const,
                            onClick: () =>
                                banUserAsync({
                                    id: v.id,
                                    status: v.status,
                                }),
                        })
                        actions.push({
                            label: 'Удалить',
                            color: 'danger' as const,
                            onClick: () => deleteUserAsync(v.id),
                        })
                    }

                    cellContent = (
                        <div className="relative flex items-center justify-end gap-2">
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button isIconOnly size="sm" variant="light">
                                        <Icon icon="tabler:dots-vertical" className="size-6 text-default-400" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Действия" items={actions} emptyContent="Действий нет">
                                    {(item) => (
                                        <DropdownItem
                                            key={item.label}
                                            aria-label={item.label}
                                            color={item.color}
                                            variant="flat"
                                            onClick={item.onClick}
                                        >
                                            {item.label}
                                        </DropdownItem>
                                    )}
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
                <Pagination showControls total={data?.total || 0} page={page} onChange={setPage}></Pagination>
            </div>
        ),
        [data?.total, setPage, page],
    )

    return (
        <>
            <h1 className="mb-4 mt-16 text-2xl font-semibold">Пользователи</h1>
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
                    onClick={() => queryClient.invalidateQueries({ queryKey: queries.users._def })}
                >
                    <Icon icon="tabler:refresh" className="size-4" />
                </Button>
            </div>

            <div className="flex items-center px-1">
                <Dropdown placement="bottom-start">
                    <DropdownTrigger>
                        <Button variant="light" size="sm" disableRipple className="!bg-transparent">
                            Статус
                            {statusFiltersCount > 0 && (
                                <span className="opacity-50">
                                    ({statusFiltersCount === 1 && 'выбран '}
                                    {statusFiltersCount > 1 && 'выбрано '}
                                    {statusFiltersCount})
                                </span>
                            )}
                            <Icon icon="tabler:chevron-down" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Статус фильтр"
                        variant="flat"
                        closeOnSelect={false}
                        selectionMode="multiple"
                        selectedKeys={statusFilters}
                        onSelectionChange={setStatusFilters}
                    >
                        <DropdownItem key="active">Активен</DropdownItem>
                        <DropdownItem key="blocked">Заблокирован</DropdownItem>
                        <DropdownItem key="deleted">Удален</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <div className="ml-auto">
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
                    <TableColumn key="actions" className="text-end">
                        ДЕЙСТВИЯ
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={'Пусто.'} isLoading={isFetching} loadingContent={<Spinner />}>
                    {data?.users.map((v) => <TableRow key={`${v.id}`}>{cellRenderer(v)}</TableRow>) || []}
                </TableBody>
            </Table>
        </>
    )
}

export const Route = createFileRoute('/_dashboard/users/')({
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
    beforeLoad: ({ search }) =>
        authenticated(async () => {
            await queryClient.fetchQuery(
                queries.users.list({
                    search: '',
                    page: search.page,
                    itemsPerPage: search.pageSize,
                    statusFilters: [],
                }),
            )
            return {
                title: '',
            }
        }),
})
