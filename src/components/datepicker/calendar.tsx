import { FC, useRef } from 'react'
import {
    useCalendar,
    useCalendarGrid,
    AriaCalendarGridProps,
    useLocale,
    useCalendarCell,
    AriaCalendarCellProps,
} from 'react-aria'
import { useCalendarState, CalendarStateOptions, CalendarState } from 'react-stately'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { getWeeksInMonth } from '@internationalized/date'

const Calendar: FC<CalendarStateOptions> = (props) => {
    const state = useCalendarState({
        ...props,
    })

    const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state)

    return (
        <>
            <div {...calendarProps} className="p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <Button {...prevButtonProps} isIconOnly variant="faded">
                        <Icon icon="tabler:chevron-left" className="size-4" />
                    </Button>
                    <div className="leading-none">{title}</div>
                    <Button {...nextButtonProps} isIconOnly variant="faded">
                        <Icon icon="tabler:chevron-right" className="size-4" />
                    </Button>
                </div>
                <CalendarGrid state={state} />
            </div>
        </>
    )
}

const CalendarGrid: FC<
    AriaCalendarGridProps & {
        state: CalendarState
    }
> = ({ state, ...props }) => {
    const { locale } = useLocale()
    const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)

    // Get the number of weeks in the month so we can render the proper number of rows.
    const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

    return (
        <table {...gridProps}>
            <thead {...headerProps}>
                <tr>
                    {weekDays.map((day, index) => (
                        <th key={index}>{day}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
                    <tr key={weekIndex}>
                        {state
                            .getDatesInWeek(weekIndex)
                            .map((date, i) =>
                                date ? <CalendarCell key={i} state={state} date={date} /> : <td key={i} />,
                            )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const CalendarCell: FC<
    AriaCalendarCellProps & {
        state: CalendarState
    }
> = ({ state, date }) => {
    const ref = useRef(null)
    const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, isUnavailable, formattedDate } =
        useCalendarCell({ date }, state, ref)

    return (
        <td {...cellProps} className="p-1">
            <div
                {...buttonProps}
                ref={ref}
                hidden={isOutsideVisibleRange}
                className={`rounded-small p-1.5 outline-none ring-primary-400 transition-all focus:ring-2 ${isSelected ? 'bg-primary-400 text-white' : ''} ${
                    isDisabled ? 'opacity-50' : ''
                } ${isUnavailable ? 'opacity-50' : ''}`}
            >
                <div className="flex size-[2ch] items-center justify-end leading-none">{formattedDate}</div>
            </div>
        </td>
    )
}

export default Calendar
