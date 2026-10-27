import { useEffect, useEffectEvent, useLayoutEffect, type RefObject } from 'react'

export type PopoverCloseReason = 'outside' | 'escape'

type UsePopoverOptions = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  popoverRef: RefObject<HTMLElement | null>
  onClose: (reason: PopoverCloseReason) => void
  offset?: number
  matchWidth?: boolean
}

const VIEWPORT_MARGIN = 8

/**
 * Positions a `position: fixed` popover next to its anchor and handles dismissal.
 *
 * - Opens below the anchor, flips above when there isn't room.
 * - Stays in the viewport horizontally.
 * - Follows the anchor on scroll/resize — by writing styles straight to the DOM
 *   (no React re-render per scroll frame, which keeps it buttery smooth).
 * - Closes on outside pointer-down and on Escape.
 */
export function usePopover({ open, anchorRef, popoverRef, onClose, offset = 6, matchWidth = true }: UsePopoverOptions) {
  const handleClose = useEffectEvent(onClose)

  // useLayoutEffect = runs before the browser paints, so there's no flash at (0, 0).
  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    const popover = popoverRef.current
    if (!anchor || !popover) return

    const position = () => {
      const rect = anchor.getBoundingClientRect()
      if (matchWidth) popover.style.minWidth = `${rect.width}px`
      const { offsetHeight: height, offsetWidth: width } = popover
      const spaceBelow = window.innerHeight - rect.bottom
      const placeAbove = spaceBelow < height + offset + VIEWPORT_MARGIN && rect.top > spaceBelow
      const top = placeAbove ? rect.top - height - offset : rect.bottom + offset
      const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN))
      popover.style.top = `${Math.max(VIEWPORT_MARGIN, top)}px`
      popover.style.left = `${left}px`
      popover.dataset.side = placeAbove ? 'top' : 'bottom'
    }

    position()
    const observer = new ResizeObserver(position)
    observer.observe(popover)
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true) // capture: catch scrolling of any ancestor
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
    }
  }, [open, anchorRef, popoverRef, offset, matchWidth])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (anchorRef.current?.contains(target) || popoverRef.current?.contains(target)) return
      handleClose('outside')
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      handleClose('escape')
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, anchorRef, popoverRef])
}
