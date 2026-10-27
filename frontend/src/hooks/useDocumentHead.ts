import { useEffect, useSyncExternalStore } from 'react'
import { getHeadSnapshot, setFaviconOverride, setTitleOverride, subscribeHead, type FaviconSpec } from '../lib/head'

/**
 * Temporarily override the tab title from inside a page.
 * Pass `null` to fall back to the route's title. Reverts on unmount.
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    setTitleOverride(title)
    return () => setTitleOverride(null)
  }, [title])
}

/** Temporarily override the favicon from inside a page. Reverts on unmount. */
export function useFavicon(favicon: FaviconSpec | null) {
  useEffect(() => {
    setFaviconOverride(favicon)
    return () => setFaviconOverride(null)
  }, [favicon])
}

/** Live view of what the tab currently shows (title, favicon, badge…). */
export function useHeadSnapshot() {
  return useSyncExternalStore(subscribeHead, getHeadSnapshot)
}
