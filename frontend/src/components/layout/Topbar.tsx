import type { Ref } from 'react'
import { Form } from 'react-router'
import type { User } from '../../api/auth'
import { useHeadSnapshot } from '../../hooks/useDocumentHead'
import { setBadge } from '../../lib/head'
import { initials } from '../../lib/utils'
import { Icon } from '../ui/Icon'
import { Breadcrumbs } from './Breadcrumbs'
import { HamburgerButton } from './HamburgerButton'
import { ThemeToggle } from './ThemeToggle'

type TopbarProps = {
  user: User
  menuOpen: boolean
  isMobile: boolean
  sidebarId: string
  onMenuClick: () => void
  menuButtonRef?: Ref<HTMLButtonElement>
}

export function Topbar({ user, menuOpen, isMobile, sidebarId, onMenuClick, menuButtonRef }: TopbarProps) {
  const { badge } = useHeadSnapshot()

  return (
    <header className="topbar">
      <HamburgerButton
        ref={menuButtonRef}
        open={menuOpen}
        morph={isMobile}
        onClick={onMenuClick}
        controls={sidebarId}
        label={isMobile ? (menuOpen ? 'Close menu' : 'Open menu') : menuOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      />
      <Breadcrumbs />
      <div className="topbar__spacer" />

      <button
        type="button"
        className="icon-btn"
        aria-label={`Notifications${badge ? `, ${badge} unread` : ''}. Click to mark all read`}
        title="Click to clear · Shift+click to add one"
        onClick={(e) => setBadge(e.shiftKey ? (n) => n + 1 : 0)}
      >
        <Icon name="bell" />
        {badge > 0 && <span className="topbar__dot">{badge > 9 ? '9+' : badge}</span>}
      </button>
      <ThemeToggle />

      <div className="topbar__user">
        <span className="avatar" aria-hidden="true">
          {initials(user.name)}
        </span>
        <span className="topbar__user-name">{user.name}</span>
        {/* Logout is a POST to the /logout route action — no click handler needed */}
        <Form method="post" action="/logout">
          <button type="submit" className="icon-btn" aria-label="Sign out" title="Sign out">
            <Icon name="logout" />
          </button>
        </Form>
      </div>
    </header>
  )
}
