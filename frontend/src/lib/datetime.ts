/*
 * Small, dependency-free date/time helpers.
 *
 * Value formats (same as the native <input type="time|date|datetime-local">):
 *   time      "HH:mm"            e.g. "21:30"
 *   date      "YYYY-MM-DD"       e.g. "2026-10-23"
 *   datetime  "YYYY-MM-DDTHH:mm" e.g. "2026-10-23T21:30"
 *
 * These are *local* wall-clock values with no timezone, which avoids the classic
 * "date shifted by one day" bug you get with `new Date('2026-10-23')` (UTC).
 * Because they are zero-padded, they also compare correctly as plain strings:
 *   "09:30" < "18:00"   and   "2026-10-23T09:30" < "2026-10-24T00:00"
 */

export type HourCycle = 12 | 24

export const pad = (n: number) => String(n).padStart(2, '0')

export const toTimeString = (hours: number, minutes: number) => `${pad(hours)}:${pad(minutes)}`

export function parseTime(value: string | null | undefined): { hours: number; minutes: number } | null {
  const match = value ? /^(\d{2}):(\d{2})$/.exec(value) : null
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

/**
 * Lenient parser for what people actually type:
 * "9" "930" "9:30" "9.30pm" "9 pm" "21:30" "12am"  →  "HH:mm" or null
 */
export function parseTimeInput(text: string): string | null {
  const s = text.trim().toLowerCase().replace(/\s+/g, '')
  const match = /^(\d{1,2})(?:[:.]?(\d{2}))?(am|pm|a|p)?$/.exec(s)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = match[2] ? Number(match[2]) : 0
  const meridiem = match[3]
  if (minutes > 59) return null
  if (meridiem) {
    if (hours < 1 || hours > 12) return null
    const pm = meridiem.startsWith('p')
    if (hours === 12) hours = pm ? 12 : 0
    else if (pm) hours += 12
  } else if (hours > 23) {
    return null
  }
  return toTimeString(hours, minutes)
}

export function formatTime(value: string | null | undefined, hourCycle: HourCycle): string {
  const time = parseTime(value)
  if (!time) return ''
  if (hourCycle === 24) return toTimeString(time.hours, time.minutes)
  const h12 = time.hours % 12 === 0 ? 12 : time.hours % 12
  return `${h12}:${pad(time.minutes)} ${time.hours < 12 ? 'AM' : 'PM'}`
}

/** Shift a time by N minutes, wrapping around midnight. */
export function addMinutes(value: string, delta: number): string {
  const time = parseTime(value) ?? { hours: 0, minutes: 0 }
  const total = (((time.hours * 60 + time.minutes + delta) % 1440) + 1440) % 1440
  return toTimeString(Math.floor(total / 60), total % 60)
}

export function nowTime(step = 1): string {
  const now = new Date()
  const minutes = Math.floor(now.getMinutes() / step) * step
  return toTimeString(now.getHours(), minutes)
}

/** Inclusive range check; `min`/`max` are optional and compared as strings. */
export function isWithin(value: string, min?: string | null, max?: string | null): boolean {
  if (min && value < min) return false
  if (max && value > max) return false
  return true
}

// ── Dates ────────────────────────────────────────────────────────────────

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toDateTimeString(date: Date): string {
  return `${toDateKey(date)}T${toTimeString(date.getHours(), date.getMinutes())}`
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" into a *local* Date. */
export function parseDateTime(value: string | null | undefined): Date | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value) : null
  if (!match) return null
  const [, y, mo, d, h = '0', mi = '0'] = match
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi))
  return Number.isNaN(date.getTime()) ? null : date
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Same day-of-month in another month, clamped (Jan 31 + 1 month → Feb 28). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  return target
}

export function startOfWeek(date: Date, weekStartsOn: number): Date {
  const offset = (date.getDay() - weekStartsOn + 7) % 7
  return addDays(date, -offset)
}

/** 6 weeks × 7 days covering the given month, so the grid never changes height. */
export function getCalendarDays(year: number, month: number, weekStartsOn: number): Date[] {
  const first = startOfWeek(new Date(year, month, 1), weekStartsOn)
  return Array.from({ length: 42 }, (_, i) => addDays(first, i))
}

export function getWeekdayLabels(weekStartsOn: number, locale?: string) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const longFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  // 2023-01-01 was a Sunday (day 0)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, 1 + ((weekStartsOn + i) % 7))
    return { short: formatter.format(date).slice(0, 2), long: longFormatter.format(date) }
  })
}
