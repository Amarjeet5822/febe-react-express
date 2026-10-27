import { Link, useLocation } from 'react-router'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  return (
    <div className="state-page">
      <p className="state-page__code">404</p>
      <h1>Page not found</h1>
      <p className="state-page__msg">
        Nothing lives at <code>{pathname}</code>. It's matched by the <code>path: '*'</code> catch-all route.
      </p>
      <div className="state-page__actions">
        <Link to="/" className="btn btn--primary btn--md" viewTransition>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
