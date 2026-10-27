import { useEffect } from 'react'
import { useMatches } from 'react-router'
import { resolveHandleText, type HandleMatch } from '../../app/routeHandle'
import { setRouteHead, type FaviconSpec } from '../../lib/head'

/**
 * Reads `handle` from every matched route (root → leaf) and pushes the
 * deepest title / favicon / description into the head manager.
 * Rendered once in the root layout; pages don't have to do anything.
 */
export function RouteHead() {
  const matches = useMatches() as HandleMatch[]

  let title = ''
  let favicon: FaviconSpec | null = null
  let description: string | null = null
  for (const match of matches) {
    const handle = match.handle
    if (!handle) continue
    title = resolveHandleText(handle.title, match) ?? title
    favicon = handle.favicon ?? favicon
    description = handle.description ?? description
  }

  useEffect(() => {
    setRouteHead({ title, favicon, description })
  }, [title, favicon, description])

  return null
}
