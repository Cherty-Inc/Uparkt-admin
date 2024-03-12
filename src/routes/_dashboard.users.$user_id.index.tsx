import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, type FC, ReactNode, Key, useCallback, useMemo } from 'react'
import {
    Accordion,
    AccordionItem,
    AvatarIcon,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
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
} from '@nextui-org/react'

import { queries } from '@/api/queries'
import Message from '@/components/message'
import * as usersService from '@api/services/users'
import { Icon } from '@iconify/react/dist/iconify.js'
import { z } from 'zod'
import { authenticated } from '@/router'
import { queryClient } from '@/main'
import { toastError, toastSuccess } from '@/utils'

const Transactions = () => {
    const userID = useParams({
        from: '/_dashboard/users/$user_id',
        select: (p) => p.user_id,
    })
    const { data: user } = useQuery(queries.users.one(userID))
    const { data, isError, error, isFetching } = useQuery(queries.users.one(userID)._ctx.money)

    const cellRenderer = useCallback((v: usersService.UserMoneyTransactionSchemeType) => {
        return function cellRendererCallback(columnKey: Key) {
            const key = columnKey.toString() as keyof typeof v

            let cellContent: ReactNode

            switch (key) {
                case 'title': {
                    cellContent = v.title
                    break
                }
                case 'description': {
                    cellContent = v.description
                    break
                }
                case 'amount': {
                    cellContent = v.amount + '₽'
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

    return (
        <>
            {isError ? (
                error.name === 'ZodError' ? (
                    <Message color="danger">Некорректные данные</Message>
                ) : (
                    <Message color="danger">Не удалось загрузить данные</Message>
                )
            ) : undefined}
            {isError && <Spacer x={0} y={4} />}

            <Table
                aria-label={`Таблица транзакций пользователя ${[user?.name, user?.surname].join(' ')} ID: ${userID}`}
                removeWrapper
            >
                <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="title">НАЗВАНИЕ</TableColumn>
                    <TableColumn key="description">ОПИСАНИЕ</TableColumn>
                    <TableColumn key="amount">СУММА</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'Пусто.'} isLoading={isFetching} loadingContent={<Spinner />}>
                    {data?.history.map((v, index) => (
                        <TableRow className="cursor-pointer" key={`${index}`}>
                            {cellRenderer(v)}
                        </TableRow>
                    )) || []}
                </TableBody>
            </Table>
        </>
    )
}

const Cars = () => {
    const userID = useParams({
        from: '/_dashboard/users/$user_id/',
        select: (p) => p.user_id,
    })
    const [page, setPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const { data: user } = useQuery(queries.users.one(userID))
    const { data, isFetching, isError, error } = useQuery({
        ...queries.users.one(userID)._ctx.cars._ctx.list({ page, itemsPerPage }),
        placeholderData: (v) => v,
    })
    const navigate = useNavigate()

    const { mutate: deleteCar } = useMutation({
        mutationFn: (vals: { userID: number; carID: number; carName?: string }) =>
            usersService.deleteUsersCar(vals.userID, vals.carID),
        onSuccess: async (_, vals) => {
            toastSuccess(['Автомобиль', vals.carName, 'удален'].filter(Boolean).join(' '))
            await navigate({
                to: '/users/$user_id/',
                params: {
                    user_id: userID,
                },
                search: {
                    view: ['cars'],
                },
                replace: true,
            })
            await queryClient.invalidateQueries(queries.users.one(vals.userID)._ctx.cars)
            queryClient.removeQueries(queries.users.one(vals.userID)._ctx.cars._ctx.one(vals.carID))
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const bottomContent = useMemo(
        () => (
            <div className="flex justify-center">
                <Pagination
                    showControls
                    total={data?.total || 0}
                    isDisabled={!data?.total}
                    initialPage={1}
                    onChange={setPage}
                />
            </div>
        ),
        [data?.total, setPage],
    )

    const cellRenderer = useCallback(
        (v: usersService.UserCarSchemeType) => {
            return function cellRendererCallback(columnKey: Key) {
                const key = columnKey.toString() as keyof typeof v | 'actions'

                let cellContent: ReactNode

                switch (key) {
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
                                            aria-label="Изменить"
                                            color="warning"
                                            variant="flat"
                                            onClick={() =>
                                                navigate({
                                                    to: '/users/$user_id/edit-car/$car_id',
                                                    params: {
                                                        car_id: v.id.toString(),
                                                        user_id: userID,
                                                    },
                                                })
                                            }
                                        >
                                            Изменить
                                        </DropdownItem>
                                        <DropdownItem
                                            aria-label="Удалить"
                                            color="danger"
                                            variant="flat"
                                            onClick={() =>
                                                deleteCar({
                                                    userID: Number(userID),
                                                    carID: v.id,
                                                    carName: v.name,
                                                })
                                            }
                                        >
                                            Удалить
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        )
                        break
                    }
                    default: {
                        cellContent = v[key]
                        break
                    }
                }

                return (
                    <TableCell>
                        <div className="min-w-max">{cellContent}</div>
                    </TableCell>
                )
            }
        },
        [userID],
    )

    return (
        <>
            {isError ? (
                error.name === 'ZodError' ? (
                    <Message color="danger">Некорректные данные</Message>
                ) : (
                    <Message color="danger">Не удалось загрузить данные</Message>
                )
            ) : undefined}
            {isError && <Spacer x={0} y={4} />}

            <Table
                aria-label={`Таблица транзакций пользователя ${[user?.name, user?.surname].join(' ')} ID: ${userID}`}
                removeWrapper
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
            >
                <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="name">НАЗВАНИЕ</TableColumn>
                    <TableColumn key="number">НОМЕР</TableColumn>
                    <TableColumn key="actions" className="text-end">
                        ДЕЙСТВИЯ
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={'Пусто.'} isLoading={isFetching} loadingContent={<Spinner />}>
                    {data?.cars.map((v) => <TableRow key={`${v.id}`}>{cellRenderer(v)}</TableRow>) || []}
                </TableBody>
            </Table>
        </>
    )
}

const Parkings = () => {
    const userID = useParams({
        from: '/_dashboard/users/$user_id',
        select: (p) => p.user_id,
    })
    const { data: user } = useQuery(queries.users.one(userID))
    const { data, isError, error, isFetching } = useQuery(queries.users.one(userID)._ctx.parkings)

    const cellRenderer = useCallback((v: usersService.UserParkingSchemeType) => {
        return function cellRendererCallback(columnKey: Key) {
            const key = columnKey.toString() as keyof typeof v | 'actions'

            let cellContent: ReactNode

            switch (key) {
                case 'photo': {
                    cellContent = <Image isZoomed src={v.photo} className="h-24 w-auto" />
                    break
                }
                case 'date': {
                    cellContent = v.date.toFormat('dd.MM.yyyy')
                    break
                }
                case 'price': {
                    cellContent = v.price + ' ₽'
                    break
                }
                case 'isActive': {
                    if (v.isActive) {
                        cellContent = (
                            <Chip variant="flat" color="success">
                                Активна
                            </Chip>
                        )
                    } else {
                        cellContent = (
                            <Chip variant="flat" color="danger">
                                Не активна
                            </Chip>
                        )
                    }
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
                                    <DropdownItem aria-label="Изменить" color="warning" variant="flat">
                                        Изменить
                                    </DropdownItem>
                                    <DropdownItem aria-label="Удалить" color="danger" variant="flat">
                                        Удалить
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )
                    break
                }
                default: {
                    cellContent = v[key]
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

    return (
        <>
            {isError ? (
                error.name === 'ZodError' ? (
                    <Message color="danger">Некорректные данные</Message>
                ) : (
                    <Message color="danger">Не удалось загрузить данные</Message>
                )
            ) : undefined}
            {isError && <Spacer x={0} y={4} />}

            <Table
                aria-label={`Таблица транзакций пользователя ${[user?.name, user?.surname].join(' ')} ID: ${userID}`}
                removeWrapper
            >
                <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="photo">ФОТО</TableColumn>
                    <TableColumn key="name">НАЗВАНИЕ</TableColumn>
                    <TableColumn key="date">ДАТА</TableColumn>
                    <TableColumn key="price">СТОИМОСТЬ</TableColumn>
                    <TableColumn key="address">АДРЕС</TableColumn>
                    <TableColumn key="isActive">Статус</TableColumn>
                    <TableColumn key="actions" className="text-end">
                        ДЕЙСТВИЯ
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={'Пусто.'} isLoading={isFetching} loadingContent={<Spinner />}>
                    {data?.parkings.map((v, index) => (
                        <TableRow className="cursor-pointer" key={`${index}`}>
                            {cellRenderer(v)}
                        </TableRow>
                    )) || []}
                </TableBody>
            </Table>
        </>
    )
}

const UserDetails: FC = () => {
    const userID = useParams({
        from: '/_dashboard/users/$user_id',
        select: (p) => p.user_id,
    })
    const navigate = useNavigate()
    const { view } = Route.useSearch()
    const selectedKeys = useMemo(() => {
        return new Set(view)
    }, [view])
    const onSelectionChange = (keys: Selection) => {
        if (keys === 'all') {
            return
        }
        navigate({
            params: {
                id: userID,
            },
            search: {
                view: Array.from(keys).map((k) => k.toString()),
            },
        })
    }

    const { data, isError } = useQuery({
        ...queries.users.one(userID),
    })

    return (
        <>
            {isError && <Message color="danger">Не удалось загрузить данные пользователя</Message>}

            {!isError && (
                <>
                    <div className="relative mb-16 mt-12 flex flex-col items-center gap-8 md:flex-row">
                        <div className="absolute right-0 top-0 inline-block rounded-full bg-foreground-600 px-4 py-2 leading-none text-background shadow-lg shadow-black/25">
                            {data?.balance} ₽
                        </div>

                        <div className="flex size-48 items-center justify-center rounded-full bg-black !bg-opacity-10 text-foreground-600 dark:bg-white">
                            <AvatarIcon />
                        </div>
                        <div className="text-center md:text-start">
                            <h1 className="mb-2 text-2xl font-semibold">{[data?.name, data?.surname].join(' ')}</h1>
                            {data?.email && (
                                <a className="mb-2 block opacity-50" href={'mailto:' + data.email}>
                                    {data.email}
                                </a>
                            )}
                            {data?.phone && <p className="mb-2 opacity-50">{data.phone}</p>}
                            <div className="flex flex-wrap justify-center gap-1 md:justify-start">
                                {data?.role.map((r) => <Chip key={r}>{r}</Chip>)}
                            </div>
                        </div>
                    </div>

                    <Accordion
                        variant="splitted"
                        selectionMode="multiple"
                        selectedKeys={selectedKeys}
                        onSelectionChange={onSelectionChange}
                    >
                        <AccordionItem
                            key="transactions-history"
                            aria-label="История транзакций"
                            title="История транзакций"
                        >
                            <Transactions />
                        </AccordionItem>
                        <AccordionItem key="cars" aria-label="Автомобили" title="Автомобили">
                            <Cars />
                        </AccordionItem>
                        <AccordionItem key="parkings" aria-label="Парковки" title="Парковки">
                            <Parkings />
                        </AccordionItem>
                    </Accordion>
                </>
            )}
        </>
    )
}

export const Route = createFileRoute('/_dashboard/users/$user_id/')({
    component: UserDetails,
    validateSearch: z.object({
        view: z.enum(['transactions-history', 'cars', 'parkings']).array().optional().catch([]),
    }),
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            await queryClient.fetchQuery(queries.users.one(params.user_id))
            return {
                title: '',
            }
        }),
})
