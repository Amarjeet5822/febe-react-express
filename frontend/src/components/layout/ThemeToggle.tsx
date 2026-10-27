import { useTheme, type ThemePreference } from '../../app/theme'
import { Icon } from '../ui/Icon'

const NEXT: Record<ThemePreference, ThemePreference> = { light: 'dark', dark: 'system', system: 'light' }
const ICON = { light: 'sun', dark: 'moon', system: 'monitor' } as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => setTheme(NEXT[theme])}
      aria-label={`Theme: ${theme}. Switch to ${NEXT[theme]}`}
      title={`Theme: ${theme}`}
    >
      <Icon name={ICON[theme]} />
    </button>
  )
}
