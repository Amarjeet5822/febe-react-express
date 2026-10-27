import type { Ref } from 'react'

type HamburgerButtonProps = {
  open: boolean
  onClick: () => void
  label: string
  controls: string
  morph?: boolean
  ref?: Ref<HTMLButtonElement>
}

/** Three bars that morph into an ✕ when `open` (CSS transforms, no icon swap). */
export function HamburgerButton({ open, onClick, label, controls, morph = true, ref }: HamburgerButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="hamburger icon-btn"
      data-open={(morph && open) || undefined}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      onClick={onClick}
    >
      <span className="hamburger__box" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </button>
  )
}
