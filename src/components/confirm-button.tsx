import { Button, ButtonProps, Popover, PopoverContent, PopoverProps, PopoverTrigger } from '@nextui-org/react'
import { FC, PropsWithChildren, useState } from 'react'

interface Props extends PropsWithChildren {
    button?: Omit<ButtonProps, 'children'>
    popover?: Omit<PopoverProps, 'children' | 'onOpenChange' | 'isOpen'>
    message?: string
    onConfirm?: () => unknown
}

const ConfirmButton: FC<Props> = ({ button, popover, children, message = 'Вы уверены?', onConfirm }) => {
    const [isOpen, setIsOpen] = useState(false)

    const onClick = () => {
        if (onConfirm) {
            onConfirm()
        }
        setIsOpen(false)
    }

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} {...popover}>
            <PopoverTrigger>
                <Button {...button}>{children}</Button>
            </PopoverTrigger>
            <PopoverContent className="p-4">
                <strong className="mb-2 font-medium">{message}</strong>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        color={button?.color || 'danger'}
                        className="flex-1"
                        onClick={onClick}
                    >
                        Да
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>
                        Нет
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ConfirmButton
