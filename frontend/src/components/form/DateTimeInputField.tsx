import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  addDays,
  addMonths,
  getCalendarDays,
  getWeekdayLabels,
  isWithin,
  nowTime,
  parseDateTime,
  startOfWeek,
  toDateKey,
  type HourCycle,
} from '../../lib/datetime'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Popover } from '../ui/Popover'
import { FieldShell, type FieldBaseProps } from './FieldShell'
import { TimeColumns } from './TimeColumns'
import { useFieldIds } from './useFieldIds'

export type DateTimeInputFieldProps = FieldBaseProps & {
  /** "YYYY-MM-DDTHH:mm" (or "YYYY-MM-DD" when showTime is false), or null. */
  value: string | null
  onChange: (value: string | null) => void
  name?: string
  /** false → a plain date picker. */
  showTime?: boolean
  /** Earliest allowed value, same format as `value` (a bare date also works). */
  min?: string
  max?: string
  hourCycle?: HourCycle
  minuteStep?: number
  /** 0 = Sunday, 1 = Monday */
  weekStartsOn?: 0 | 1
  locale?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** Time used when a day is picked before any time was chosen. */
  defaultTime?: string
  /**
   * Which view opens first when there's no value yet.
   * 'years' suits far-away dates like a date of birth: year → month → day in 3 clicks.
   */
  openTo?: 'days' | 'years'
}

type CalendarView = 'days' | 'months' | 'years'

const DAY_MOVES: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
/** Year and month views are 4-column grids. */
const PICK_MOVES: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }
const YEARS_PER_PAGE = 12

/**
 * Date + time picker with a fully keyboard-operable calendar:
 *   ←/→ day · ↑/↓ week · PageUp/PageDown month (+Shift = year) · Home/End week · Enter select
 * Values are timezone-free local strings, so what you pick is exactly what you get.
 */
export function DateTimeInputField({
  id: idProp,
  label,
  hideLabel,
  helperText,
  error,
  required,
  optional,
  size = 'md',
  labelAction,
  className,
  value,
  onChange,
  name,
  showTime = true,
  min,
  max,
  hourCycle = 12,
  minuteStep = 5,
  weekStartsOn = 1,
  locale,
  placeholder,
  clearable = true,
  disabled,
  readOnly,
  defaultTime = '09:00',
  openTo = 'days',
}: DateTimeInputFieldProps) {
  const controlRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const focusDayOnRender = useRef(false)
  const focusPickOnRender = useRef(false)

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<CalendarView>('days')
  const [focusedDate, setFocusedDate] = useState(() => new Date())
  const [slide, setSlide] = useState<'next' | 'prev' | null>(null)

  const { id, labelId, helperId, errorId, describedBy } = useFieldIds(idProp, {
    hasHelper: Boolean(helperText),
    hasError: Boolean(error),
  })

  const selected = parseDateTime(value)
  const selectedDay = value?.slice(0, 10) ?? null
  const selectedTime = showTime && value ? value.slice(11, 16) : null
  const minDay = min?.slice(0, 10)
  const maxDay = max?.slice(0, 10)
  const minFull = min && (min.length > 10 ? min : `${min}T00:00`)
  const maxFull = max && (max.length > 10 ? max : `${max}T23:59`)
  const interactive = !disabled && !readOnly
  const todayKey = toDateKey(new Date())

  const isDayDisabled = (day: Date) => !isWithin(toDateKey(day), minDay, maxDay)

  const clampDate = (date: Date) => {
    const key = toDateKey(date)
    if (minDay && key < minDay) return parseDateTime(minDay)!
    if (maxDay && key > maxDay) return parseDateTime(maxDay)!
    return date
  }

  // Move keyboard focus to the focused day after it re-renders (only when the keyboard asked for it).
  useEffect(() => {
    if (!open || !focusDayOnRender.current) return
    focusDayOnRender.current = false
    calendarRef.current?.querySelector<HTMLElement>(`[data-date="${toDateKey(focusedDate)}"]`)?.focus()
  }, [open, focusedDate, view])

  // Same idea for the year / month grids: focus the cell for focusedDate.
  useEffect(() => {
    if (!open || view === 'days' || !focusPickOnRender.current) return
    focusPickOnRender.current = false
    calendarRef.current?.querySelector<HTMLElement>('[data-current]')?.focus()
  }, [open, view, focusedDate])

  const openPicker = () => {
    if (!interactive) return
    const initialView = selected ? 'days' : openTo
    setFocusedDate(clampDate(selected ?? new Date()))
    setSlide(null)
    setView(initialView)
    focusDayOnRender.current = initialView === 'days'
    focusPickOnRender.current = initialView !== 'days'
    setOpen(true)
  }

  const closePicker = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const moveTo = (date: Date, fromKeyboard: boolean) => {
    const monthDelta = date.getFullYear() * 12 + date.getMonth() - (focusedDate.getFullYear() * 12 + focusedDate.getMonth())
    if (monthDelta !== 0) setSlide(monthDelta > 0 ? 'next' : 'prev')
    focusDayOnRender.current = fromKeyboard
    setFocusedDate(date)
  }

  const clampToRange = (full: string) => {
    if (minFull && full < minFull) return minFull
    if (maxFull && full > maxFull) return maxFull
    return full
  }

  const selectDay = (day: Date) => {
    if (isDayDisabled(day)) return
    const key = toDateKey(day)
    setFocusedDate(day)
    if (!showTime) {
      onChange(key)
      closePicker()
      return
    }
    onChange(clampToRange(`${key}T${selectedTime ?? defaultTime}`))
  }

  const selectTime = (time: string) => {
    const day = selectedDay ?? toDateKey(focusedDate)
    onChange(clampToRange(`${day}T${time}`))
  }

  const pickNow = () => {
    const now = new Date()
    if (!showTime) return selectDay(now)
    onChange(clampToRange(`${toDateKey(now)}T${nowTime(minuteStep)}`))
    setFocusedDate(now)
  }

  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: Date | null = null
    if (e.key in DAY_MOVES) next = addDays(focusedDate, DAY_MOVES[e.key]!)
    else if (e.key === 'PageUp') next = addMonths(focusedDate, e.shiftKey ? -12 : -1)
    else if (e.key === 'PageDown') next = addMonths(focusedDate, e.shiftKey ? 12 : 1)
    else if (e.key === 'Home') next = startOfWeek(focusedDate, weekStartsOn)
    else if (e.key === 'End') next = addDays(startOfWeek(focusedDate, weekStartsOn), 6)
    if (!next) return
    e.preventDefault()
    moveTo(next, true)
  }

  // ── Year / month views ─────────────────────────────────────────────────
  /** Same day in another year/month, clamped to the month's length and to min/max. */
  const withYearMonth = (year: number, month: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate()
    return clampDate(new Date(year, month, Math.min(focusedDate.getDate(), lastDay)))
  }

  const isYearDisabled = (year: number) =>
    Boolean((minDay && String(year) < minDay.slice(0, 4)) || (maxDay && String(year) > maxDay.slice(0, 4)))

  const isMonthDisabled = (year: number, month: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    return Boolean((minDay && key < minDay.slice(0, 7)) || (maxDay && key > maxDay.slice(0, 7)))
  }

  const pickYear = (year: number) => {
    if (isYearDisabled(year)) return
    setFocusedDate(withYearMonth(year, focusedDate.getMonth()))
    setSlide(null)
    focusPickOnRender.current = true
    setView('months')
  }

  const pickMonth = (month: number) => {
    if (isMonthDisabled(focusedDate.getFullYear(), month)) return
    setFocusedDate(withYearMonth(focusedDate.getFullYear(), month))
    setSlide(null)
    focusDayOnRender.current = true
    setView('days')
  }

  /** ‹ › buttons: a month in day view, a year in month view, 12 years in year view. */
  const stepView = (dir: 1 | -1) => {
    const months = view === 'days' ? 1 : view === 'months' ? 12 : 12 * YEARS_PER_PAGE
    moveTo(addMonths(focusedDate, dir * months), false)
  }

  const onPickKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = PICK_MOVES[e.key]
    if (delta === undefined) return
    e.preventDefault()
    focusPickOnRender.current = true
    moveTo(addMonths(focusedDate, view === 'years' ? delta * 12 : delta), false)
  }

  // ── Derived display values ─────────────────────────────────────────────
  const displayFormat = new Intl.DateTimeFormat(
    locale,
    showTime ? { dateStyle: 'medium', timeStyle: 'short', hour12: hourCycle === 12 } : { dateStyle: 'medium' },
  )
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focusedDate)
  const dayLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'full' })
  const weekdays = getWeekdayLabels(weekStartsOn, locale)
  const days = getCalendarDays(focusedDate.getFullYear(), focusedDate.getMonth(), weekStartsOn)
  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7))
  const focusedKey = toDateKey(focusedDate)
  const focusedYear = focusedDate.getFullYear()
  const pageStart = Math.floor(focusedYear / YEARS_PER_PAGE) * YEARS_PER_PAGE
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i)
  const monthNames = Array.from({ length: 12 }, (_, m) =>
    new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2023, m, 1)),
  )
  const todayYear = new Date().getFullYear()
  const todayMonth = new Date().getMonth()

  const titleLabel = view === 'days' ? monthLabel : view === 'months' ? String(focusedYear) : `${pageStart} – ${pageStart + YEARS_PER_PAGE - 1}`
  const stepLabel = view === 'days' ? 'month' : view === 'months' ? 'year' : `${YEARS_PER_PAGE} years`

  const isTimeDisabled = (time: string) => {
    const day = selectedDay ?? focusedKey
    return !isWithin(`${day}T${time}`, minFull, maxFull)
  }

  return (
    <FieldShell
      id={id}
      labelId={labelId}
      helperId={helperId}
      errorId={errorId}
      label={label}
      hideLabel={hideLabel}
      helperText={helperText}
      error={error}
      required={required}
      optional={optional}
      labelAction={labelAction}
      className={className}
    >
      <div
        ref={controlRef}
        className="control"
        data-size={size}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        <span className="control__affix">
          <Icon name="calendar" size={16} />
        </span>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className="control__trigger"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          onClick={() => (open ? closePicker(false) : openPicker())}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !open) {
              e.preventDefault()
              openPicker()
            }
          }}
        >
          {selected ? (
            <span className="control__value">{displayFormat.format(selected)}</span>
          ) : (
            <span className="control__placeholder">{placeholder ?? (showTime ? 'Select date & time' : 'Select date')}</span>
          )}
        </button>
        {clearable && value && interactive && (
          <button type="button" className="control__btn" aria-label="Clear date" onClick={() => onChange(null)}>
            <Icon name="x" size={15} />
          </button>
        )}
        <span className="control__chevron" data-open={open || undefined} aria-hidden="true">
          <Icon name="chevronDown" size={16} />
        </span>
        {name && <input type="hidden" name={name} value={value ?? ''} />}
      </div>

      <Popover
        open={open && interactive}
        anchorRef={controlRef}
        matchWidth={false}
        onClose={(reason) => closePicker(reason === 'escape')}
        className="picker"
        role="dialog"
        aria-modal="false"
        aria-label={showTime ? 'Choose date and time' : 'Choose date'}
      >
        <div className="picker__body">
          <div ref={calendarRef} className="calendar">
            <div className="calendar__header">
              <button type="button" className="calendar__nav" aria-label={`Previous ${stepLabel}`} onClick={() => stepView(-1)}>
                <Icon name="chevronLeft" size={16} />
              </button>
              {/* Click the title to zoom out: days → years → months → days */}
              <button
                type="button"
                className="calendar__title"
                aria-live="polite"
                aria-label={view === 'years' ? `${titleLabel}, back to days` : `${titleLabel}, choose year`}
                onClick={() => {
                  setSlide(null)
                  focusPickOnRender.current = view !== 'years'
                  focusDayOnRender.current = view === 'years'
                  setView(view === 'years' ? 'days' : 'years')
                }}
              >
                {titleLabel}
                <Icon name="chevronDown" size={14} className="calendar__title-icon" data-open={view !== 'days' || undefined} />
              </button>
              <button type="button" className="calendar__nav" aria-label={`Next ${stepLabel}`} onClick={() => stepView(1)}>
                <Icon name="chevronRight" size={16} />
              </button>
            </div>

            {view === 'years' && (
              <div key={pageStart} className="calendar__picks" data-slide={slide ?? undefined} role="group" aria-label="Years" onKeyDown={onPickKeyDown}>
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className="calendar__pick"
                    data-current={year === focusedYear || undefined}
                    data-today={year === todayYear || undefined}
                    aria-pressed={year === selected?.getFullYear()}
                    aria-disabled={isYearDisabled(year) || undefined}
                    tabIndex={year === focusedYear ? 0 : -1}
                    onClick={() => pickYear(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {view === 'months' && (
              <div key={focusedYear} className="calendar__picks" data-slide={slide ?? undefined} role="group" aria-label={`Months of ${focusedYear}`} onKeyDown={onPickKeyDown}>
                {monthNames.map((name, month) => (
                  <button
                    key={name}
                    type="button"
                    className="calendar__pick"
                    data-current={month === focusedDate.getMonth() || undefined}
                    data-today={(focusedYear === todayYear && month === todayMonth) || undefined}
                    aria-pressed={selected?.getFullYear() === focusedYear && selected.getMonth() === month}
                    aria-disabled={isMonthDisabled(focusedYear, month) || undefined}
                    tabIndex={month === focusedDate.getMonth() ? 0 : -1}
                    onClick={() => pickMonth(month)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {view === 'days' && (
            <div role="grid" aria-label={monthLabel} className="calendar__grid" onKeyDown={onGridKeyDown}>
              <div role="row" className="calendar__row">
                {weekdays.map((w) => (
                  <span key={w.long} role="columnheader" className="calendar__weekday" aria-label={w.long}>
                    {w.short}
                  </span>
                ))}
              </div>
              {/* key = month → re-mounts and plays the slide animation on month change */}
              <div key={`${focusedDate.getFullYear()}-${focusedDate.getMonth()}`} className="calendar__weeks" data-slide={slide ?? undefined}>
                {weeks.map((week) => (
                  <div role="row" className="calendar__row" key={toDateKey(week[0]!)}>
                    {week.map((day) => {
                      const key = toDateKey(day)
                      const isDisabled = isDayDisabled(day)
                      return (
                        <span role="gridcell" key={key} aria-selected={key === selectedDay}>
                          <button
                            type="button"
                            data-date={key}
                            className={cn(
                              'calendar__day',
                              day.getMonth() !== focusedDate.getMonth() && 'calendar__day--outside',
                              key === todayKey && 'calendar__day--today',
                              key === selectedDay && 'calendar__day--selected',
                            )}
                            tabIndex={key === focusedKey ? 0 : -1}
                            aria-disabled={isDisabled || undefined}
                            aria-label={dayLabel.format(day)}
                            aria-current={key === todayKey ? 'date' : undefined}
                            onClick={() => selectDay(day)}
                          >
                            {day.getDate()}
                          </button>
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>

          {showTime && (
            <div className="picker__time">
              <p className="picker__time-label">Time</p>
              <TimeColumns
                value={selectedTime}
                onChange={selectTime}
                hourCycle={hourCycle}
                minuteStep={minuteStep}
                isDisabled={isTimeDisabled}
              />
            </div>
          )}
        </div>

        <div className="picker__footer">
          <button type="button" className="picker__link" onClick={pickNow}>
            {showTime ? 'Now' : 'Today'}
          </button>
          {showTime && (
            <button type="button" className="picker__done" onClick={() => closePicker()}>
              Done
            </button>
          )}
        </div>
      </Popover>
    </FieldShell>
  )
}
