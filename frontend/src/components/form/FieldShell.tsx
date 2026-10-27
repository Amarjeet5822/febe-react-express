import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import './form.css'

export type FieldSize = 'sm' | 'md' | 'lg'

/** Props every field component shares (label, help, error…). */
export type FieldBaseProps = {
  id?: string
  label?: ReactNode
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean
  helperText?: ReactNode
  error?: ReactNode
  required?: boolean
  /** Shows "(optional)" next to the label. */
  optional?: boolean
  size?: FieldSize
  /** Extra element on the right of the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode
  className?: string
}

type FieldShellProps = Pick<FieldBaseProps, 'label' | 'hideLabel' | 'helperText' | 'error' | 'required' | 'optional' | 'labelAction' | 'className'> & {
  id: string
  labelId: string
  helperId: string
  errorId: string
  counter?: ReactNode
  onLabelClick?: () => void
  children: ReactNode
}

/**
 * Layout shared by every input: label row → control → helper/error + counter.
 * Keeping it in one place means every field looks and behaves identically.
 */
export function FieldShell({
  id,
  labelId,
  helperId,
  errorId,
  label,
  hideLabel,
  helperText,
  error,
  required,
  optional,
  labelAction,
  counter,
  className,
  onLabelClick,
  children,
}: FieldShellProps) {
  const hasFooter = Boolean(error || helperText || counter)
  return (
    <div className={cn('field', className)}>
      {label && (
        <div className={cn('field__label-row', hideLabel && 'sr-only')}>
          <label className="field__label" htmlFor={id} id={labelId} onClick={onLabelClick}>
            {label}
            {required && (
              <span className="field__required" aria-hidden="true">
                *
              </span>
            )}
            {optional && !required && <span className="field__optional">(optional)</span>}
          </label>
          {labelAction}
        </div>
      )}

      {children}

      {hasFooter && (
        <div className="field__footer">
          {error ? (
            <p className="field__error" id={errorId}>
              <Icon name="alert" size={14} />
              <span>{error}</span>
            </p>
          ) : helperText ? (
            <p className="field__helper" id={helperId}>
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {counter}
        </div>
      )}
    </div>
  )
}
