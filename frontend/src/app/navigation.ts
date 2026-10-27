import type { IconName } from '../components/ui/Icon'

export type NavItem = { label: string; to: string; icon: IconName; end?: boolean }
export type NavSection = { title?: string; items: NavItem[] }

/** Single source of truth for the sidebar menu. */
export const NAVIGATION: NavSection[] = [
  {
    items: [{ label: 'Dashboard', to: '/', icon: 'dashboard', end: true }],
  },
  {
    title: 'Components',
    items: [
      { label: 'Input Field', to: '/components/inputs', icon: 'input' },
      { label: 'Date & Time', to: '/components/date-time', icon: 'calendar' },
      { label: 'Dropdown', to: '/components/dropdown', icon: 'list' },
    ],
  },
  {
    title: 'App',
    items: [
      { label: 'Users', to: '/users', icon: 'users' },
      { label: 'Tab title & icon', to: '/tab-head', icon: 'tab' },
      { label: 'Settings', to: '/settings', icon: 'settings' },
    ],
  },
]
