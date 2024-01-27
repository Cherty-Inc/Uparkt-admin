import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'

export const toastSuccess = (message: string) => {
    toast(message, {
        className: 'success-toast',
        icon: <Icon icon="tabler:square-rounded-check" className="size-6 text-green-500" />,
    })
}

export const toastError = (message: string) => {
    toast(message, {
        className: 'error-toast',
        icon: <Icon icon="tabler:square-rounded-x" className="size-6 text-red-500" />,
    })
}
