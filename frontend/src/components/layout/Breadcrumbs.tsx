import { Link, useMatches } from 'react-router'
import { resolveHandleText, type HandleMatch } from '../../app/routeHandle'
import { Icon } from '../ui/Icon'

/** Breadcrumbs built from `handle.crumb` of each matched route. */
export function Breadcrumbs() {
  const matches = useMatches() as HandleMatch[]
  const crumbs = matches
    .map((match) => ({ label: resolveHandleText(match.handle?.crumb, match), to: match.pathname }))
    .filter((crumb): crumb is { label: string; to: string } => Boolean(crumb.label))

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={crumb.to}>
              {isLast ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <>
                  <Link to={crumb.to} viewTransition>
                    {crumb.label}
                  </Link>
                  <Icon name="chevronRight" size={14} className="breadcrumbs__sep" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
