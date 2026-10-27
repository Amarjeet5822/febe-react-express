import { useEffect, useRef, useState } from 'react'
import { Outlet, useLoaderData } from 'react-router'
import type { requireUserLoader } from '../api/auth'
import { Sidebar } from '../components/layout/Sidebar'
import { Topbar } from '../components/layout/Topbar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { AppShellContext } from './appShell'
import './app-layout.css'

const SIDEBAR_ID = 'app-sidebar'

/**
 * The authenticated shell: sidebar + topbar + <Outlet /> for the page.
 * Child routes render into <Outlet />; this component never re-mounts while
 * navigating between them, so the sidebar keeps its state and scroll.
 */
export default function AppLayout() {
  const { user } = useLoaderData<typeof requireUserLoader>()
  const isMobile = useMediaQuery('(max-width: 899px)')
  const [collapsed, setCollapsed] = useLocalStorage('befe:sidebar-collapsed', false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerOpen = isMobile && mobileOpen

  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useLockBodyScroll(drawerOpen)

  const closeDrawer = () => {
    setMobileOpen(false)
    menuButtonRef.current?.focus() // return focus to where it came from
  }

  // Move focus into the drawer when it opens; Escape closes it.
  useEffect(() => {
    if (!drawerOpen) return
    const sidebar = sidebarRef.current
    ;(sidebar?.querySelector<HTMLElement>('a.active') ?? sidebar?.querySelector<HTMLElement>('a'))?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  // Ctrl/Cmd + B toggles the sidebar, like VS Code / Notion / Linear.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'b' || !(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      if (isMobile) setMobileOpen((open) => !open)
      else setCollapsed((c) => !c)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobile, setCollapsed])

  const shell: AppShellContext = { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed }

  return (
    <div className="app-shell" data-collapsed={(!isMobile && collapsed) || undefined}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Sidebar
        ref={sidebarRef}
        id={SIDEBAR_ID}
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onClose={closeDrawer}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Dimmed backdrop behind the mobile drawer; click to close */}
      <div className="drawer-backdrop" data-open={drawerOpen || undefined} onClick={closeDrawer} aria-hidden="true" />

      <div className="app-shell__body">
        <Topbar
          user={user}
          isMobile={isMobile}
          sidebarId={SIDEBAR_ID}
          menuOpen={isMobile ? mobileOpen : !collapsed}
          menuButtonRef={menuButtonRef}
          onMenuClick={() => (isMobile ? setMobileOpen((open) => !open) : setCollapsed((c) => !c))}
        />
        <main id="main" className="app-main" tabIndex={-1}>
          <Outlet context={shell} />
        </main>
      </div>
    </div>
  )
}
