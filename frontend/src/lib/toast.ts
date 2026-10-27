/*
 * Minimal toast store. Call `toast('Saved')` from anywhere — components,
 * loaders, actions — and <Toaster /> renders it. Same external-store pattern
 * as lib/head.ts.
 */

export type ToastTone = 'success' | 'error' | 'info'
export type Toast = { id: number; title: string; description?: string; tone: ToastTone }

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

export function toast(
  title: string,
  options: { description?: string; tone?: ToastTone; duration?: number } = {},
) {
  const item: Toast = { id: nextId++, title, description: options.description, tone: options.tone ?? 'success' }
  toasts = [...toasts, item].slice(-4)
  emit()
  window.setTimeout(() => dismissToast(item.id), options.duration ?? 4000)
  return item.id
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getToasts = () => toasts
