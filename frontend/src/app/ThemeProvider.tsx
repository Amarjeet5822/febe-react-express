import { useEffect, useMemo, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { THEME_STORAGE_KEY, ThemeContext, type ThemePreference } from './theme'

/*
 * The very first paint is themed by the inline script in index.html (no flash
 * of the wrong theme). From then on this provider keeps <html data-theme> in sync.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setStoredTheme] = useLocalStorage<ThemePreference>(THEME_STORAGE_KEY, 'system')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#0f1115' : '#f6f7f9')
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: ThemePreference) => {
        // Cross-fade the whole page between themes when the browser supports it.
        if (!document.startViewTransition) return setStoredTheme(next)
        document.startViewTransition(() => {
          flushSync(() => setStoredTheme(next))
          document.documentElement.dataset.theme =
            next === 'system' ? (prefersDark ? 'dark' : 'light') : next
        })
      },
    }),
    [theme, resolvedTheme, setStoredTheme, prefersDark],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
