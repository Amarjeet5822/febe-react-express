import type { UIMatch } from 'react-router'
import type { FaviconSpec } from '../lib/head'

/*
 * `handle` is free-form metadata you can attach to any route.
 * We use it for the tab title, favicon, meta description and breadcrumb.
 * `title`/`crumb` can be functions of the route's loader data, e.g. a user's name.
 */
type FromData = (loaderData: never) => string

export type RouteHandle = {
  title?: string | FromData
  crumb?: string | FromData
  favicon?: FaviconSpec
  description?: string
}

export type HandleMatch = UIMatch<unknown, RouteHandle | undefined>

export function resolveHandleText(value: string | FromData | undefined, match: HandleMatch): string | undefined {
  if (typeof value !== 'function') return value
  // No data when the loader threw (e.g. 404) — fall back to the parent's title/crumb.
  if (match.loaderData == null) return undefined
  return (value as (data: unknown) => string)(match.loaderData)
}
