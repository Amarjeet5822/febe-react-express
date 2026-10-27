import type { Ref } from 'react'
import { NavLink } from 'react-router'
import { NAVIGATION } from '../../app/navigation'
import { Icon } from '../ui/Icon'

type SidebarProps = {
  id: string
  collapsed: boolean
  isMobile: boolean
  mobileOpen: boolean
  onNavigate: () => void
  onClose: () => void
  onToggleCollapse: () => void
  ref?: Ref<HTMLElement>
}

/*
 * One component, two behaviours:
 *  - desktop: always visible, can collapse to an icon rail (with tooltips)
 *  - mobile:  off-canvas drawer; `inert` when closed so links can't be tabbed to
 */
export function Sidebar({ id, collapsed, isMobile, mobileOpen, onNavigate, onClose, onToggleCollapse, ref }: SidebarProps) {
  const isRail = !isMobile && collapsed

  return (
    <aside
      ref={ref}
      id={id}
      className="sidebar"
      data-rail={isRail || undefined}
      data-mobile={isMobile || undefined}
      data-open={(isMobile && mobileOpen) || undefined}
      aria-label="Main navigation"
      inert={isMobile && !mobileOpen}
    >
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          ⚡
        </span>
        <span className="sidebar__brand-name sidebar__label">BeFe Studio</span>
        {isMobile && (
          <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label="Close menu">
            <Icon name="x" />
          </button>
        )}
      </div>

      <nav className="sidebar__nav">
        {NAVIGATION.map((section, i) => (
          <div className="sidebar__section" key={section.title ?? i}>
            {section.title && <p className="sidebar__section-title sidebar__label">{section.title}</p>}
            <ul>
              {section.items.map((item) => (
                <li key={item.to}>
                  {/* NavLink adds class="active" + aria-current="page" when the route matches */}
                  <NavLink
                    to={item.to}
                    end={item.end}
                    viewTransition
                    className="sidebar__link"
                    data-tooltip={item.label}
                    aria-label={isRail ? item.label : undefined}
                    onClick={onNavigate}
                  >
                    <Icon name={item.icon} size={19} />
                    <span className="sidebar__label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {!isMobile && (
        <button
          type="button"
          className="sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
        >
          <Icon name="chevronsLeft" size={18} />
          <span className="sidebar__label">Collapse</span>
          <kbd className="sidebar__label">Ctrl B</kbd>
        </button>
      )}
    </aside>
  )
}
