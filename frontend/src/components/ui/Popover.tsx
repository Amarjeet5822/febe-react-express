import { useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { usePopover, type PopoverCloseReason } from '../../hooks/usePopover'
import { cn, mergeRefs } from '../../lib/utils'
import './ui.css'

type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  onClose: (reason: PopoverCloseReason) => void
  matchWidth?: boolean
  children: ReactNode
  popoverRef?: RefObject<HTMLDivElement | null>
}

/*
 * Rendered in a portal on <body>, so a parent with `overflow: hidden`
 * (cards, tables, modals) can never clip the menu.
 */
export function Popover({ open, anchorRef, onClose, matchWidth = true, className, children, popoverRef, ...rest }: PopoverProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  usePopover({ open, anchorRef, popoverRef: innerRef, onClose, matchWidth })

  if (!open) return null
  return createPortal(
    <div ref={mergeRefs(innerRef, popoverRef)} className={cn('popover', className)} {...rest}>
      {children}
    </div>,
    document.body,
  )
}
