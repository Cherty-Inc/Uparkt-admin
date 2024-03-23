import { DateValue, useLocale, useDateField, useDateSegment, AriaDateFieldProps } from 'react-aria'
import { DateSegment as _DateSegment, DateFieldState, useDateFieldState } from 'react-stately'
import { createCalendar } from '@internationalized/date'
import { useRef } from 'react'

import { Card } from '@nextui-org/react'

function DateField<T extends DateValue>(props: AriaDateFieldProps<T>) {
    const { locale } = useLocale()
    const state = useDateFieldState({
        ...props,
        locale,
        createCalendar,
        shouldForceLeadingZeros: true,
    })

    const ref = useRef(null)
    const { fieldProps } = useDateField(props, state, ref)

    return (
        <div className="w-full">
            <Card
                {...(fieldProps as any)}
                ref={ref}
                shadow="none"
                className="flex h-14 flex-row items-center gap-0 bg-default-100 px-4 transition-colors hover:bg-default-200"
            >
                {state.segments.map((segment, i) => (
                    <DateSegment key={i} segment={segment} state={state} />
                ))}
            </Card>
        </div>
    )
}

function DateSegment({ segment, state }: { segment: _DateSegment; state: DateFieldState }) {
    const ref = useRef(null)
    const { segmentProps } = useDateSegment(segment, state, ref)

    return (
        <div
            {...(segmentProps as any)}
            ref={ref}
            className="rounded-small px-1 py-1.5 leading-none outline-none ring-primary-400 transition-shadow focus:ring-2"
        >
            {segment.text}
        </div>
    )
}

export default DateField
