import { useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { cn, mergeRefs, setNativeInputValue } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Spinner } from '../ui/Spinner'
import { FieldShell, type FieldBaseProps } from './FieldShell'
import { useFieldIds } from './useFieldIds'

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>

export type InputFieldProps = NativeInputProps &
  FieldBaseProps & {
    /** Content inside the box, before the text: an icon, "₹", "https://"… */
    prefix?: ReactNode
    /** Content inside the box, after the text: an icon, ".com", "kg"… */
    suffix?: ReactNode
    /** Shows an ✕ button when there's text. */
    clearable?: boolean
    onClear?: () => void
    /** Shows "12/50" — requires `maxLength`. */
    showCount?: boolean
    loading?: boolean
    /** Class for the outer wrapper (className goes to the <input>). */
    containerClassName?: string
    ref?: Ref<HTMLInputElement>
  }

/**
 * Text input that covers what real products need:
 *  label / required / optional / helper / error (with full ARIA wiring),
 *  prefix & suffix, clear button, password show/hide + Caps Lock warning,
 *  character counter, loading state, sizes, disabled / read-only,
 *  and it works both controlled (`value` + `onChange`) and uncontrolled (`defaultValue` + `ref`).
 *  Every other native <input> prop (name, type, autoComplete, pattern, onBlur…) passes straight through.
 */
export function InputField({
  id: idProp,
  label,
  hideLabel,
  helperText,
  error,
  required,
  optional,
  size = 'md',
  labelAction,
  prefix,
  suffix,
  clearable,
  onClear,
  showCount,
  loading,
  containerClassName,
  className,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onKeyUp,
  onBlur,
  maxLength,
  disabled,
  readOnly,
  ref,
  ...rest
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref])

  // Track the text ourselves only when uncontrolled — needed for the counter & clear button.
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''))
  const currentValue = isControlled ? String(value ?? '') : uncontrolledValue

  const [revealed, setRevealed] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const isPassword = type === 'password'

  const capsWarning = isPassword && capsLock ? 'Caps Lock is on' : undefined
  const { id, labelId, helperId, errorId, describedBy } = useFieldIds(idProp, {
    hasHelper: Boolean(helperText || capsWarning),
    hasError: Boolean(error),
  })

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isPassword) setCapsLock(e.getModifierState('CapsLock'))
    onKeyUp?.(e)
  }

  const handleClear = () => {
    const el = inputRef.current
    if (!el) return
    setNativeInputValue(el, '') // fires onChange, so controlled parents update too
    onClear?.()
    el.focus()
  }

  const showClear = clearable && currentValue.length > 0 && !disabled && !readOnly
  const counter =
    showCount && maxLength ? (
      <span className="field__counter" data-limit={currentValue.length >= maxLength || undefined} aria-live="polite">
        {currentValue.length}/{maxLength}
      </span>
    ) : undefined

  return (
    <FieldShell
      id={id}
      labelId={labelId}
      helperId={helperId}
      errorId={errorId}
      label={label}
      hideLabel={hideLabel}
      helperText={capsWarning ?? helperText}
      error={error}
      required={required}
      optional={optional}
      labelAction={labelAction}
      counter={counter}
      className={containerClassName}
    >
      <div
        className="control"
        data-size={size}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        onMouseDown={(e) => {
          // Clicking the padding/prefix area focuses the input, like a native field.
          if (e.target === e.currentTarget) {
            e.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        {prefix && <span className="control__affix">{prefix}</span>}
        <input
          ref={mergedRef}
          id={id}
          type={isPassword && revealed ? 'text' : type}
          className={cn('control__input', className)}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            if (!isControlled) setUncontrolledValue(e.target.value)
            onChange?.(e)
          }}
          onKeyUp={handleKeyUp}
          onBlur={(e) => {
            setCapsLock(false)
            onBlur?.(e)
          }}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {loading && <Spinner size={16} className="control__spinner" label="Loading" />}
        {showClear && (
          <button
            type="button"
            className="control__btn"
            aria-label="Clear"
            onMouseDown={(e) => e.preventDefault()} // keep focus in the input
            onClick={handleClear}
          >
            <Icon name="x" size={15} />
          </button>
        )}
        {isPassword && !disabled && (
          <button
            type="button"
            className="control__btn"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setRevealed((r) => !r)}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={16} />
          </button>
        )}
        {suffix && <span className="control__affix">{suffix}</span>}
      </div>
    </FieldShell>
  )
}
