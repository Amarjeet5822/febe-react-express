import type { Ref, RefCallback } from 'react'

/** Join class names, skipping falsy values: cn('a', isOn && 'b') */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Combine several refs (callback or object) into one ref callback. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/**
 * Set an input's value the way the browser would, so React's onChange fires.
 * React tracks the last value it saw; assigning `el.value` directly is ignored,
 * so we call the native setter and dispatch a real `input` event instead.
 */
export function setNativeInputValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

/** Only allow same-origin relative paths, to prevent open-redirect attacks. */
export function safeRedirect(to: string | null | undefined, fallback = '/'): string {
  if (!to || !to.startsWith('/') || to.startsWith('//')) return fallback
  return to
}
