import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { nowTime, pad, parseTime, toTimeString, type HourCycle } from '../../lib/datetime'

type ColumnItem = { key: string; label: string; selected: boolean; disabled: boolean; onSelect: () => void }

/** One scrollable column (hours, minutes or AM/PM). Arrow keys move between items. */
function TimeColumn({ label, items }: { label: string; items: ColumnItem[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const hasScrolled = useRef(false)
  const selectedIndex = items.findIndex((item) => item.selected)
  const tabStop = selectedIndex >= 0 ? selectedIndex : items.findIndex((item) => !item.disabled)

  // Keep the selected item centred; jump on first render, glide afterwards.
  useLayoutEffect(() => {
    const list = listRef.current
    const el = list?.children[Math.max(0, selectedIndex)] as HTMLElement | undefined
    if (!list || !el) return
    const top = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2
    list.scrollTo({ top, behavior: hasScrolled.current ? 'smooth' : 'instant' })
    hasScrolled.current = true
  }, [selectedIndex])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      e.key === 'Home' ? 0
      : e.key === 'End' ? buttons.length - 1
      : Math.min(buttons.length - 1, Math.max(0, current + (e.key === 'ArrowDown' ? 1 : -1)))
    buttons[next]?.focus()
  }

  return (
    <div ref={listRef} className="time-col" role="group" aria-label={label} onKeyDown={onKeyDown}>
      {items.map((item, i) => (
        <button
          key={item.key}
          type="button"
          className="time-col__item"
          aria-pressed={item.selected}
          disabled={item.disabled}
          tabIndex={i === tabStop ? 0 : -1}
          onClick={item.onSelect}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

type TimeColumnsProps = {
  value: string | null
  onChange: (value: string) => void
  hourCycle: HourCycle
  minuteStep: number
  /** Return true for times that can't be picked (outside min/max etc.). */
  isDisabled?: (time: string) => boolean
}

const range = (start: number, end: number, step: number) =>
  Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step)

/** Hour / minute / AM-PM columns. Shared by TimeInputField and DateTimeInputField. */
export function TimeColumns({ value, onChange, hourCycle, minuteStep, isDisabled = () => false }: TimeColumnsProps) {
  const time = parseTime(value)
  const base = time ?? parseTime(nowTime(minuteStep))!
  const isPm = base.hours >= 12
  const minutes = range(0, 60, minuteStep)

  const hourFullyDisabled = (h24: number) => minutes.every((m) => isDisabled(toTimeString(h24, m)))

  // Pick a time; if that exact minute is blocked, snap to the first allowed minute in that hour.
  const pick = (h24: number, m: number) => {
    const exact = toTimeString(h24, m)
    if (!isDisabled(exact)) return onChange(exact)
    const firstAllowed = minutes.find((mm) => !isDisabled(toTimeString(h24, mm)))
    if (firstAllowed !== undefined) onChange(toTimeString(h24, firstAllowed))
  }

  const hours = hourCycle === 24 ? range(0, 24, 1) : [12, ...range(1, 12, 1)]
  const to24 = (h: number, pm: boolean) => (hourCycle === 24 ? h : (h % 12) + (pm ? 12 : 0))

  return (
    <div className="time-cols">
      <TimeColumn
        label="Hours"
        items={hours.map((h) => {
          const h24 = to24(h, isPm)
          return {
            key: String(h),
            label: hourCycle === 24 ? pad(h) : String(h),
            selected: time?.hours === h24,
            disabled: hourFullyDisabled(h24),
            onSelect: () => pick(h24, base.minutes),
          }
        })}
      />
      <TimeColumn
        label="Minutes"
        items={minutes.map((m) => ({
          key: String(m),
          label: pad(m),
          selected: time?.minutes === m,
          disabled: isDisabled(toTimeString(base.hours, m)),
          onSelect: () => pick(base.hours, m),
        }))}
      />
      {hourCycle === 12 && (
        <TimeColumn
          label="AM or PM"
          items={(['AM', 'PM'] as const).map((period) => {
            const pm = period === 'PM'
            const h24 = (base.hours % 12) + (pm ? 12 : 0)
            return {
              key: period,
              label: period,
              selected: time ? time.hours >= 12 === pm : false,
              disabled: hourFullyDisabled(h24),
              onSelect: () => pick(h24, base.minutes),
            }
          })}
        />
      )}
    </div>
  )
}
