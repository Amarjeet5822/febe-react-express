import { useTheme, type ThemePreference } from '../../app/theme'
import { Icon, type IconName } from '../../components/ui/Icon'
import { Switch } from '../../components/ui/Switch'
import { useAppShell } from '../../layouts/appShell'

const THEMES: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
]

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppShell() // from <Outlet context>

  return (
    <section className="card settings-panel">
      <h2 className="settings-panel__title">Theme</h2>
      <p className="muted">Saved to localStorage and applied before first paint (see the script in index.html).</p>
      <div className="theme-options" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <label key={t.value} className="theme-option" data-checked={theme === t.value || undefined}>
            <input type="radio" name="theme" value={t.value} checked={theme === t.value} onChange={() => setTheme(t.value)} className="sr-only" />
            <span className={`theme-option__preview theme-option__preview--${t.value}`} aria-hidden="true" />
            <span className="theme-option__label">
              <Icon name={t.icon} size={16} /> {t.label}
            </span>
          </label>
        ))}
      </div>

      <hr className="divider" />

      <Switch
        label="Collapsed sidebar"
        description="Same state as Ctrl+B — shared from the layout via useOutletContext()."
        checked={sidebarCollapsed}
        onChange={setSidebarCollapsed}
      />
    </section>
  )
}
