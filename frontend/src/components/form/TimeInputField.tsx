import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { addMinutes, formatTime, isWithin, nowTime, parseTimeInput, type HourCycle } from '../../lib/datetime'
import { Icon } from '../ui/Icon'
import { Popover } from '../ui/Popover'
import { FieldShell, type FieldBaseProps } from './FieldShell'
import { TimeColumns } from './TimeColumns'
import { useFieldIds } from './useFieldIds'

export type TimeInputFieldProps = FieldBaseProps & {
  /** "HH:mm" in 24h format (e.g. "21:30"), or null when empty. */
  value: string | null
  onChange: (value: string | null) => void
  /** Adds a hidden <input name=…> so it works inside a plain <form> / React Router <Form>. */
  name?: string
  /** How the time is *displayed*; the value is always 24h. */
  hourCycle?: HourCycle
  minuteStep?: number
  min?: string
  max?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  readOnly?: boolean
  onBlur?: () => void
}

/**
 * Time field you can type into *or* pick from.
 *  - Typing is forgiving: "930", "9.30pm", "21:30", "9 pm" all work (parsed on blur / Enter).
 *  - ↑ / ↓ step the time by `minuteStep`; Alt+↓ opens the picker; Esc reverts/close.
 *  - min / max disable out-of-range times in the picker and reject typed ones.
 */
export function TimeInputField({
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
  hourCycle = 12,
  minuteStep = 15,
  min,
  max,
  placeholder,
  clearable = true,
  disabled,
  readOnly,
  onBlur,
}: TimeInputFieldProps) {
  const controlRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null) // what the user is typing, before it's parsed
  const [typingError, setTypingError] = useState<string | null>(null)

  const shownError = error ?? typingError
  const { id, labelId, helperId, errorId, describedBy } = useFieldIds(idProp, {
    hasHelper: Boolean(helperText),
    hasError: Boolean(shownError),
  })

  const isDisabled = useCallback((time: string) => !isWithin(time, min, max), [min, max])
  const text = draft ?? formatTime(value, hourCycle)
  const interactive = !disabled && !readOnly

  const commit = (next: string | null) => {
    setDraft(null)
    setTypingError(null)
    if (next !== value) onChange(next)
  }

  const rangeMessage = () => {
    if (min && max) return `Choose a time between ${formatTime(min, hourCycle)} and ${formatTime(max, hourCycle)}`
    if (min) return `Choose a time at or after ${formatTime(min, hourCycle)}`
    return `Choose a time at or before ${formatTime(max, hourCycle)}`
  }

  const commitDraft = () => {
    if (draft === null) return
    if (draft.trim() === '') return commit(null)
    const parsed = parseTimeInput(draft)
    if (!parsed) return setTypingError(`Enter a valid time, e.g. ${hourCycle === 12 ? '9:30 PM' : '21:30'}`)
    if (isDisabled(parsed)) return setTypingError(rangeMessage())
    commit(parsed)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!interactive) return
    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault()
      setOpen(true)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const base = (draft && parseTimeInput(draft)) || value || nowTime(minuteStep)
      const next = addMinutes(base, e.key === 'ArrowUp' ? minuteStep : -minuteStep)
      if (!isDisabled(next)) commit(next)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commitDraft()
      setOpen(false)
    } else if (e.key === 'Escape' && draft !== null) {
      setDraft(null)
      setTypingError(null)
    }
  }

  const nowValue = nowTime(minuteStep)

  return (
    <FieldShell
      id={id}
      labelId={labelId}
      helperId={helperId}
      errorId={errorId}
      label={label}
      hideLabel={hideLabel}
      helperText={helperText}
      error={shownError}
      required={required}
      optional={optional}
      labelAction={labelAction}
      className={className}
    >
      <div
        ref={controlRef}
        className="control"
        data-size={size}
        data-invalid={shownError ? true : undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        <span className="control__affix">
          <Icon name="clock" size={16} />
        </span>
        <input
          ref={inputRef}
          id={id}
          className="control__input"
          inputMode="text"
          autoComplete="off"
          placeholder={placeholder ?? (hourCycle === 12 ? 'hh:mm AM' : 'HH:mm')}
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          aria-haspopup="dialog"
          aria-expanded={open}
          onChange={(e) => {
            setDraft(e.target.value)
            setTypingError(null)
          }}
          onClick={() => interactive && setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            commitDraft()
            onBlur?.()
          }}
        />
        {clearable && value && interactive && (
          <button
            type="button"
            className="control__btn"
            aria-label="Clear time"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              commit(null)
              inputRef.current?.focus()
            }}
          >
            <Icon name="x" size={15} />
          </button>
        )}
        {name && <input type="hidden" name={name} value={value ?? ''} />}
      </div>

      <Popover
        open={open && interactive}
        anchorRef={controlRef}
        onClose={() => setOpen(false)}
        matchWidth={false}
        className="picker"
        role="dialog"
        aria-label="Choose time"
        // Keep focus in the text input while clicking inside the picker.
        onMouseDown={(e) => e.preventDefault()}
      >
        <TimeColumns value={value} onChange={commit} hourCycle={hourCycle} minuteStep={minuteStep} isDisabled={isDisabled} />
        <div className="picker__footer">
          <button type="button" className="picker__link" disabled={isDisabled(nowValue)} onClick={() => commit(nowValue)}>
            Now
          </button>
          <button type="button" className="picker__done" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      </Popover>
    </FieldShell>
  )
}
