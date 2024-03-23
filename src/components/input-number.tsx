import { useNumberFieldState, NumberFieldStateOptions } from 'react-stately'
import { useLocale, useNumberField } from 'react-aria'

// Reuse the Button from your component library. See below for details.
import { useRef } from 'react'
import { Button, Input } from '@nextui-org/react'
import { Icon } from '@iconify/react/dist/iconify.js'

function InputNumber(props: Omit<NumberFieldStateOptions, 'locale'>) {
    const { locale } = useLocale()
    const state = useNumberFieldState({ ...props, locale })
    const inputRef = useRef(null)
    const { groupProps, inputProps, incrementButtonProps, decrementButtonProps } = useNumberField(
        props,
        state,
        inputRef,
    )

    return (
        <div {...groupProps} className="relative">
            <div className="absolute right-3 top-0 z-20 flex h-14 items-center gap-1">
                <Button {...decrementButtonProps} isIconOnly size="sm" variant="flat">
                    <Icon icon="tabler:minus" className="size-3.5" />
                </Button>
                <Button {...incrementButtonProps} isIconOnly size="sm" variant="flat">
                    <Icon icon="tabler:plus" className="size-3.5" />
                </Button>
            </div>

            <Input
                {...(inputProps as any)}
                isDisabled={inputProps.disabled}
                errorMessage={props.errorMessage}
                label={props.label}
                className="grow"
                ref={inputRef}
            />
        </div>
    )
}

export default InputNumber
