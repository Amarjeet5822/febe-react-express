import { Link, useRouteLoaderData } from 'react-router'
import type { requireUserLoader } from '../api/auth'
import { Icon, type IconName } from '../components/ui/Icon'
import { PageHeader } from '../components/ui/Page'

const TOPICS: { to: string; icon: IconName; title: string; points: string[] }[] = [
  {
    to: '/users',
    icon: 'route',
    title: 'Routing',
    points: ['Data router + loaders', 'Dynamic segments /users/:id', 'Search params in the URL', 'Lazy routes & code splitting'],
  },
  {
    to: '/tab-head',
    icon: 'tab',
    title: 'Tab title & favicon',
    points: ['Per-route titles via handle', 'Dynamic SVG favicons', 'Unread badge "(3)"', 'Away message & flashing'],
  },
  {
    to: '/components/inputs',
    icon: 'input',
    title: 'Input Field',
    points: ['Label / helper / error + ARIA', 'Prefix, suffix, clear, counter', 'Password reveal + Caps Lock', 'Controlled & uncontrolled'],
  },
  {
    to: '/components/date-time',
    icon: 'calendar',
    title: 'Date & Time',
    points: ['Typeable time with lenient parsing', 'Keyboard calendar grid', 'min / max ranges', '12h & 24h'],
  },
  {
    to: '/components/dropdown',
    icon: 'list',
    title: 'Dropdown',
    points: ['Single & multi select', 'Search + highlight', 'Groups & typeahead', 'Async loading'],
  },
  {
    to: '/settings',
    icon: 'settings',
    title: 'Settings',
    points: ['Nested layout routes', 'Unsaved-changes blocker', 'Outlet context', 'Theme switching'],
  },
]

export default function DashboardPage() {
  // Read data from a *parent* route's loader by its route id.
  const { user } = useRouteLoaderData<typeof requireUserLoader>('app')!

  return (
    <>
      <PageHeader
        title={`Hi ${user.name.split(' ')[0]} 👋`}
        description="Every card below is a concept you'll use in almost every production app. Open one, then read its source."
      />
      <div className="topic-grid">
        {TOPICS.map((topic) => (
          <Link key={topic.to} to={topic.to} viewTransition className="card topic">
            <span className="topic__icon">
              <Icon name={topic.icon} size={20} />
            </span>
            <h2 className="topic__title">{topic.title}</h2>
            <ul className="topic__points">
              {topic.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <span className="topic__go">
              Explore <Icon name="chevronRight" size={14} />
            </span>
          </Link>
        ))}
      </div>

      <section className="card tips">
        <h2>Try these</h2>
        <ul>
          <li>
            Press <kbd>Ctrl</kbd> + <kbd>B</kbd> to collapse the sidebar; shrink the window to see the hamburger drawer.
          </li>
          <li>Watch the browser tab: the title and icon change on every page.</li>
          <li>
            Shift-click the bell to add unread notifications — the favicon gets a red badge.
          </li>
          <li>
            Visit a missing page like <Link to="/does/not/exist">/does/not/exist</Link> or user{' '}
            <Link to="/users/999">/users/999</Link>.
          </li>
        </ul>
      </section>
    </>
  )
}
