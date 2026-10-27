import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '../components/ui/Button'
import { useDocumentTitle, useFavicon } from '../hooks/useDocumentHead'

const ERROR_FAVICON = { emoji: '⚠️' }

/**
 * Rendered by React Router whenever a loader/action throws or a component
 * crashes while rendering. Thrown `data(…, { status })` arrive as route error responses.
 */
export default function RouteErrorPage() {
  const error = useRouteError()
  const isResponse = isRouteErrorResponse(error)
  const status = isResponse ? error.status : 500
  const title = isResponse ? (status === 404 ? 'Not found' : error.statusText || 'Error') : 'Something went wrong'
  const message = isResponse ? String(error.data) : error instanceof Error ? error.message : 'Unknown error'

  useDocumentTitle(`${status} · ${title}`)
  useFavicon(ERROR_FAVICON)

  return (
    <div className="state-page">
      <p className="state-page__code">{status}</p>
      <h1>{title}</h1>
      <p className="state-page__msg">{message}</p>
      <div className="state-page__actions">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload
        </Button>
        <Link to="/" className="btn btn--primary btn--md">
          Go home
        </Link>
      </div>
      {import.meta.env.DEV && error instanceof Error && error.stack && <pre className="state-page__stack">{error.stack}</pre>}
    </div>
  )
}
