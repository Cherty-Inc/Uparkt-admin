import { Icon } from '@iconify/react'
import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Table,
    TableBody,
    TableColumn,
    TableHeader,
} from '@nextui-org/react'
import { createFileRoute } from '@tanstack/react-router'
import { type FC } from 'react'

const Cars: FC = () => {
    return (
        <>
            <h1 className="mb-4 mt-8 text-2xl font-semibold">Таблица</h1>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <Input
                    className="w-full transition-all focus-within:grow md:w-72"
                    variant="flat"
                    size="sm"
                    radius="md"
                    endContent={<Icon icon="tabler:search" />}
                />

                <ButtonGroup className="w-full md:w-auto">
                    <Button color="primary" className="w-full border-r border-background">
                        Действие
                    </Button>

                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Button color="primary" isIconOnly>
                                <Icon icon="tabler:chevron-down" className="size-5" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu disabledKeys={[]} aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="refresh" color="default">
                                Обновить
                            </DropdownItem>
                            <DropdownItem key="logout" color="danger">
                                Удалить
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </ButtonGroup>
            </div>

            <Table aria-label="Example empty table">
                <TableHeader>
                    <TableColumn>КОЛОНКА 1</TableColumn>
                    <TableColumn>КОЛОНКА 2</TableColumn>
                    <TableColumn>КОЛОНКА 3</TableColumn>
                    <TableColumn>КОЛОНКА 4</TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No rows to display.'}>{[]}</TableBody>
            </Table>
        </>
    )
}

export const Route = createFileRoute('/_auth/_dashboard/example')({
    component: Cars,
    beforeLoad: () => ({
        title: 'Пример',
    }),
})
