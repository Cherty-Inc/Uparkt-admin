import { FC, useCallback, useMemo, useRef } from 'react'
import { useDatePicker, AriaDatePickerProps, useLocale } from 'react-aria'
import { useDatePickerState } from 'react-stately'
import { CalendarDate, createCalendar } from '@internationalized/date'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { Icon } from '@iconify/react/dist/iconify.js'

import DateField from './datefield'
import Calendar from './calendar'
import { DateTime } from 'luxon'

/**
 * @param {string} value - ISO 8601 formatted date
 */
export type OnDateChangeCallback = (value: string) => void

type Props = Omit<AriaDatePickerProps<CalendarDate>, 'onChange' | 'value'> & {
    onChange: OnDateChangeCallback
    value: string
}

const DatePicker: FC<Props> = ({ onChange, value, ...props }) => {
    const { locale } = useLocale()

    const _onChange = useCallback<Exclude<AriaDatePickerProps<CalendarDate>['onChange'], null | undefined>>(
        (value) => {
            onChange(value.toString())
        },
        [onChange],
    )

    const _value = useMemo(() => {
        if (value) {
            console.log(value)
            const dt = DateTime.fromISO(value)
            console.log({
                year: dt.year,
                month: dt.month,
                day: dt.day,
            })
            return new CalendarDate(dt.year, dt.month, dt.day)
        }
    }, [value])

    const state = useDatePickerState({
        onChange: _onChange,
        value: _value,
        ...props,
    })
    const ref = useRef(null)
    const { groupProps, fieldProps, buttonProps, calendarProps } = useDatePicker(
        {
            onChange: _onChange,
            value: _value,
            ...props,
        },
        state,
        ref,
    )

    return (
        <div className="flex flex-col">
            {props.label && <div className="ml-3 text-small opacity-80">{props.label}</div>}

            <div {...groupProps} ref={ref} className="relative">
                <DateField {...fieldProps} />
                <div className="absolute right-3 top-0 flex h-full items-center">
                    <Popover>
                        <PopoverTrigger>
                            <Button {...buttonProps} isIconOnly variant="flat" size="sm">
                                <Icon icon="tabler:calendar" className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar {...calendarProps} locale={locale} createCalendar={createCalendar} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export default DatePicker
