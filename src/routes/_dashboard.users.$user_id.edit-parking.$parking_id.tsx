import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type FC, useCallback } from 'react'

import { queries } from '@/api/queries'
import Message from '@/components/message'
import { queryClient } from '@/main'
import { authenticated } from '@/router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'

import * as usersService from '@api/services/users'
import { toastError, toastSuccess } from '@/utils'
import { Button, Checkbox, CheckboxGroup, Input, Skeleton, Textarea } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import ConfirmButton from '@/components/confirm-button'
import ImageWithModal from '@/components/image-with-modal'
import FileUploader, { FileUploaderOnDrop } from '@/components/file-uploader'
import DatePicker from '@/components/datepicker'
import InputNumber from '@/components/input-number'
import { privateAxios } from '@/api/axios'
import mime from 'mime-types'

const schema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    address: z.object({
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
    }),
    from_date: z.string(),
    to_date: z.string(),
    quantity: z.number(),
    photos: z
        .object({
            src: z.string(),
        })
        .array(),
    services: z.number().array(),
})

const ParkingEdit: FC = () => {
    const { user_id: userID, parking_id: parkingID } = Route.useParams()

    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data, isError, isSuccess } = useQuery(queries.users.one(userID)._ctx.parkings._ctx.one(parkingID))

    const {
        handleSubmit,
        control,
        formState: { isLoading: isFormLoading, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: () => queryClient.ensureQueryData(queries.users.one(userID)._ctx.parkings._ctx.one(parkingID)),
    })

    const { fields, remove, append } = useFieldArray({
        control,
        name: 'photos',
    })

    const { mutateAsync } = useMutation({
        mutationFn: usersService.setUserParking,
        onSuccess: (_, vars) => {
            toastSuccess(['Парковка', vars.name, 'обновлена'].filter(Boolean).join(' '))
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const { mutate: deleteParking } = useMutation({
        mutationFn: (vals: { userID: number; parkingID: number; name?: string }) =>
            usersService.deleteUsersParking(vals.userID, vals.parkingID),
        onSuccess: async (_, vals) => {
            toastSuccess(['Парковка', vals.name, 'удалена'].filter(Boolean).join(' '))
            await navigate({
                to: '/users/$user_id/',
                params: {
                    user_id: userID,
                },
                search: {
                    view: ['parkings'],
                },
                replace: true,
            })
            await queryClient.invalidateQueries(queries.users.one(vals.userID)._ctx.cars)
            queryClient.removeQueries(queries.users.one(vals.userID)._ctx.parkings._ctx.one(vals.parkingID))
        },
        onError: () => {
            toastError('Ошибка')
        },
    })

    const onImageDrop: FileUploaderOnDrop = (acceptedFiles) => {
        const objectUrls = acceptedFiles.map((f) => ({ src: URL.createObjectURL(f) }))
        append(objectUrls)
    }

    const onSubmit = handleSubmit(async (data) => {
        let uploadedPhotos = []
        const formData = new FormData()
        for (const photoUrl of data.photos) {
            if (photoUrl.src.startsWith('blob:')) {
                const blob = await fetch(photoUrl.src).then((r) => r.blob())
                const file = new File([blob], `img.${mime.extension(blob.type)}`)
                formData.append('files', file)
            } else {
                uploadedPhotos.push(photoUrl.src)
            }
        }

        // upload blob files
        const response = await privateAxios.post('/api/v1.0/files/upload_files', formData)
        uploadedPhotos = uploadedPhotos.concat(response.data.files_path)

        const update: usersService.SetUserParkingSchemeType = {
            ...data,
            id_user: Number(userID),
            id_parking: Number(parkingID),
            information: {
                address: data.address,
                from_date: data.from_date,
                to_date: data.to_date,
            },
            services: {
                services: data.services,
            },
            photos: uploadedPhotos,
        }
        await mutateAsync(update)
        await queryClient.invalidateQueries(queries.users.one(userID)._ctx.parkings)
    })

    return (
        <>
            {isError && <Message color="danger">Не удалось загрузить данные о парковке</Message>}
            {!isError && (
                <>
                    <DevTool control={control} />
                    <div className="my-16">
                        <Skeleton isLoaded={isSuccess}>
                            <div className="flex justify-between gap-4">
                                <h1 className="text-4xl font-bold">{data?.name || 'Без названия'}</h1>
                                <ConfirmButton
                                    button={{ isIconOnly: true, color: 'danger', variant: 'shadow' }}
                                    popover={{ placement: 'bottom-end' }}
                                    onConfirm={() =>
                                        deleteParking({
                                            userID: Number(userID),
                                            parkingID: Number(parkingID),
                                            name: data?.name,
                                        })
                                    }
                                >
                                    <Icon icon="tabler:trash" className="size-4" />
                                </ConfirmButton>
                            </div>
                            <p className="text-lg opacity-50">ID: {data?.id}</p>
                        </Skeleton>
                    </div>

                    <form className="flex flex-col gap-4 pb-4" onSubmit={onSubmit}>
                        <div className="mb-16 flex gap-4 overflow-x-auto py-2">
                            {fields.map((f, idx) => (
                                <div className="relative shrink-0 overflow-hidden rounded-small" key={f.id}>
                                    <Button
                                        className="absolute right-0 top-0 !z-30 rounded-bl-small rounded-tr-small"
                                        variant="solid"
                                        radius="none"
                                        size="sm"
                                        color="danger"
                                        isIconOnly
                                        onClick={() => remove(idx)}
                                    >
                                        <Icon icon="tabler:trash" className="size-4" />
                                    </Button>
                                    {f.src.startsWith('blob:') && (
                                        <div className="absolute left-1 top-1 z-20">
                                            <Icon icon="tabler:stars-filled" className="size-6 text-warning-500" />
                                        </div>
                                    )}

                                    <ImageWithModal
                                        previewProps={{
                                            isZoomed: true,
                                            radius: 'sm',
                                            className: 'h-48 w-auto cursor-pointer',
                                        }}
                                        src={f.src}
                                    />
                                </div>
                            ))}
                            <div className="size-48 shrink-0">
                                <FileUploader onDrop={onImageDrop} />
                            </div>
                        </div>

                        <h2 className="text-lg">Общие данные</h2>
                        <div>
                            <Controller
                                name="name"
                                control={control}
                                disabled={isFormLoading}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onBlur={field.onBlur}
                                        isDisabled={field.disabled}
                                        label="Имя"
                                        errorMessage={error?.message}
                                    />
                                )}
                            />
                            <div className="h-4"></div>
                            <Controller
                                name="description"
                                control={control}
                                disabled={isFormLoading}
                                render={({ field, fieldState: { error } }) => (
                                    <Textarea
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onBlur={field.onBlur}
                                        isDisabled={field.disabled}
                                        label="Описание"
                                        errorMessage={error?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className="mb-8 flex flex-col gap-x-4 gap-y-4 md:flex-row">
                            <div className="flex-1">
                                <Controller
                                    name="quantity"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <InputNumber
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            minValue={0}
                                            label="Количество"
                                            errorMessage={error?.message}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <Controller
                                    name="price"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <InputNumber
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            minValue={0}
                                            label="Цена"
                                            formatOptions={{
                                                style: 'currency',
                                                currency: 'RUB',
                                                currencyDisplay: 'symbol',
                                                maximumFractionDigits: 2,
                                            }}
                                            errorMessage={error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <h2 className="text-lg">Период аренды</h2>
                        <div className="mb-8 flex flex-col gap-x-4 gap-y-4 md:flex-row">
                            <div className="flex-1">
                                <Controller
                                    name="from_date"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <DatePicker
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            label="Дата начала"
                                            errorMessage={error?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="flex-1">
                                <Controller
                                    name="to_date"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <DatePicker
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            label="Дата конца"
                                            errorMessage={error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <h2 className="text-lg">Местоположение</h2>
                        <Controller
                            name="address.address"
                            control={control}
                            disabled={isFormLoading}
                            render={({ field, fieldState: { error } }) => (
                                <Input
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    isDisabled={field.disabled}
                                    label="Адрес"
                                    errorMessage={error?.message}
                                />
                            )}
                        />
                        <div className="mb-8 flex flex-col gap-x-4 gap-y-4 lg:flex-row">
                            <div className="flex-1">
                                <Controller
                                    name="address.longitude"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <InputNumber
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            label="Долгота"
                                            errorMessage={error?.message}
                                            formatOptions={{
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 24,
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <Controller
                                    name="address.latitude"
                                    control={control}
                                    disabled={isFormLoading}
                                    render={({ field, fieldState: { error } }) => (
                                        <InputNumber
                                            onChange={field.onChange}
                                            value={field.value}
                                            onBlur={field.onBlur}
                                            isDisabled={field.disabled}
                                            label="Широта"
                                            errorMessage={error?.message}
                                            formatOptions={{
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 24,
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <h2 className="text-lg">Сервисы</h2>
                        <Controller
                            name="services"
                            control={control}
                            disabled={isFormLoading}
                            render={({ field }) => <ServiceSelector value={field.value} onChange={field.onChange} />}
                        />

                        <div className="mt-8 flex justify-center">
                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                variant="shadow"
                                startContent={<Icon icon="tabler:device-floppy" className="size-5" />}
                                isDisabled={isFormLoading || isSubmitting}
                                className="w-full max-w-sm"
                            >
                                Сохранить
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </>
    )
}

const ServiceSelector: FC<{
    value: number[]
    onChange: (ids: number[]) => void
}> = ({ value, onChange }) => {
    const { data: allServices } = useQuery({
        ...queries.services.list,
        placeholderData: [],
    })

    const selection = value?.map((t) => t.toString()) || []

    const _setSelection = useCallback(
        (ids: string[], id_category: number) => {
            const service = allServices?.find((v) => v.id === id_category)
            const newSet = new Set(selection)
            // delete old set of entries

            console.log(
                'deleting',
                service?.services.map((s) => s.id.toString()),
            )
            service?.services.forEach((s) => newSet.delete(s.id.toString()))

            // add new set entries
            console.log('adding', ids)
            ids.forEach((id) => newSet.add(id))

            const result = Array.from(newSet).map(Number)

            onChange(result)
        },
        [onChange, allServices, selection],
    )

    return (
        <div className="flex flex-wrap gap-6">
            {allServices!.map((s) => (
                <CheckboxGroup
                    value={selection}
                    onValueChange={(v) =>
                        _setSelection(
                            v.filter((id) => s.services.find((t) => t.id.toString() === id)),
                            s.id,
                        )
                    }
                    key={s.id}
                    label={s.title}
                    className="mb-4"
                >
                    {s.services.map((ss) => (
                        <Checkbox key={ss.id} value={ss.id.toString()}>
                            {ss.title}
                        </Checkbox>
                    ))}
                </CheckboxGroup>
            ))}
        </div>
    )
}

export const Route = createFileRoute('/_dashboard/users/$user_id/edit-parking/$parking_id')({
    component: ParkingEdit,
    beforeLoad: async ({ params }) =>
        authenticated(async () => {
            const data = await queryClient.fetchQuery(
                queries.users.one(params.user_id)._ctx.parkings._ctx.one(params.parking_id),
            )
            return {
                title: data.name,
            }
        }),
})
