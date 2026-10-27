import { NavLink, Outlet } from 'react-router'
import { PageHeader } from '../../components/ui/Page'
import { useAppShell } from '../../layouts/appShell'

const TABS = [
  { to: 'profile', label: 'Profile' },
  { to: 'appearance', label: 'Appearance' },
]

/**
 * A nested layout route: /settings renders this, and /settings/profile or
 * /settings/appearance render *inside* its <Outlet />.
 */
export default function SettingsLayout() {
  const shell = useAppShell()
  return (
    <>
      <PageHeader title="Settings" description="Nested routes: the tab bar stays, only the panel below changes." />
      <nav className="tabs" aria-label="Settings sections">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="tabs__tab" viewTransition>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {/* Forward the app-shell context one level deeper */}
      <Outlet context={shell} />
    </>
  )
}
