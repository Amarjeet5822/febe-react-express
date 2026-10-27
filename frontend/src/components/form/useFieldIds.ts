import { useId } from 'react'

/**
 * Stable, unique ids that wire a label, helper text and error message to a control:
 *   <label for={id}>   <input id={id} aria-describedby="…-helper …-error">
 * Screen readers then read "Email, required, invalid entry, Enter a valid email".
 */
export function useFieldIds(idProp: string | undefined, opts: { hasHelper: boolean; hasError: boolean }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const helperId = `${id}-helper`
  const errorId = `${id}-error`
  const labelId = `${id}-label`
  const describedBy = [opts.hasError ? errorId : opts.hasHelper ? helperId : null].filter(Boolean).join(' ') || undefined
  return { id, labelId, helperId, errorId, describedBy }
}
