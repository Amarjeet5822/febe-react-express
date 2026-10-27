import { useEffect, useState } from 'react'

/** useState that survives reloads. Values are stored as JSON. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initialValue : (JSON.parse(raw) as T)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be full or blocked (private mode) — the in-memory value still works.
    }
  }, [key, value])

  return [value, setValue] as const
}
