import { Link, useLoaderData, useNavigate, useParams } from 'react-router'
import type { userLoader } from '../../api/users'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { initials } from '../../lib/utils'

const STATUS_TONE = { active: 'success', invited: 'warning', suspended: 'danger' } as const

export default function UserDetailPage() {
  const { user } = useLoaderData<typeof userLoader>()
  const { userId } = useParams() // the :userId segment from the URL
  const navigate = useNavigate()
  const prevId = String(Number(userId) - 1)
  const nextId = String(Number(userId) + 1)

  return (
    <>
      <div className="detail-nav">
        {/* navigate(-1) = browser back, so the list keeps its search query */}
        <Button variant="ghost" size="sm" icon={<Icon name="arrowLeft" size={16} />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="row">
          <Link to={`../${prevId}`} relative="path" className="btn btn--secondary btn--sm" viewTransition aria-disabled={userId === '1'}>
            <Icon name="chevronLeft" size={16} /> Prev
          </Link>
          <Link to={`../${nextId}`} relative="path" className="btn btn--secondary btn--sm" viewTransition>
            Next <Icon name="chevronRight" size={16} />
          </Link>
        </div>
      </div>

      <section className="card profile">
        <span className="avatar avatar--xl">{initials(user.name)}</span>
        <div>
          <h1 className="profile__name">{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <span className="badge" data-tone={STATUS_TONE[user.status]}>
          {user.status}
        </span>
      </section>

      <dl className="card detail-list">
        <div>
          <dt>User ID</dt>
          <dd>
            <code>{user.id}</code>
          </dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </div>
        <div>
          <dt>Team</dt>
          <dd>{user.team}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{new Date(user.joinedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</dd>
        </div>
      </dl>

      <p className="muted note">
        Look at the browser tab: its title is this user's name, produced by <code>handle.title(loaderData)</code> in{' '}
        <code>src/app/router.tsx</code>. Try “Next” past user 20 to see the 404 error boundary.
      </p>
    </>
  )
}
