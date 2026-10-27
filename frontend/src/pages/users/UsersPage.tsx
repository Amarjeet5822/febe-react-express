import { useEffect, useState } from 'react'
import { Link, useLoaderData, useNavigation, useSearchParams } from 'react-router'
import type { usersLoader } from '../../api/users'
import { InputField } from '../../components/form'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/Page'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { initials } from '../../lib/utils'

const STATUS_TONE = { active: 'success', invited: 'warning', suspended: 'danger' } as const

/**
 * The search box writes to the URL (?q=…). Changing the URL re-runs the
 * loader, which returns filtered users. Result: back/forward, reload and
 * shared links all "just work" — the URL is the state.
 */
export default function UsersPage() {
  const { users, q } = useLoaderData<typeof usersLoader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const [query, setQuery] = useState(q)
  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    if (debouncedQuery === q) return
    // replace: don't push a history entry for every keystroke
    setSearchParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true, preventScrollReset: true })
  }, [debouncedQuery, q, setSearchParams])

  // Loading new results for *this* page (not navigating away)
  const searching = navigation.state === 'loading' && navigation.location.pathname === '/users'

  return (
    <>
      <PageHeader title="Users" description={`${users.length} ${users.length === 1 ? 'person' : 'people'} · data comes from a route loader`} />

      <div className="toolbar">
        <InputField
          label="Search users"
          hideLabel
          type="search"
          placeholder="Search by name, email, team, role…"
          prefix={<Icon name="search" size={16} />}
          clearable
          loading={searching}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="toolbar__search"
        />
      </div>

      <div className="card table-wrap" data-pending={searching || undefined}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th className="hide-sm">Team</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {/* Relative link: resolves to /users/:id */}
                  <Link to={user.id} viewTransition className="user-cell">
                    <span className="avatar">{initials(user.name)}</span>
                    <span>
                      <span className="user-cell__name">{user.name}</span>
                      <span className="user-cell__email">{user.email}</span>
                    </span>
                  </Link>
                </td>
                <td>{user.role}</td>
                <td className="hide-sm">{user.team}</td>
                <td>
                  <span className="badge" data-tone={STATUS_TONE[user.status]}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="empty">
            <Icon name="search" size={28} />
            <p>
              No users match <strong>“{q}”</strong>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
