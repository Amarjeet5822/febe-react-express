/*
 * Document head manager — owns the browser tab's title and favicon.
 *
 * Several parts of the app want a say in what the tab shows:
 *   1. the current route          → "Users · BeFe Studio"           (RouteHead)
 *   2. a page, temporarily        → "Editing draft… · BeFe Studio"  (useDocumentTitle)
 *   3. unread notifications       → "(3) Users · BeFe Studio" + red dot on the icon
 *   4. the tab being in background→ "👋 Come back!"
 *   5. a flashing alert           → alternates "🔔 New message" / normal title
 *
 * Instead of letting each one write `document.title` (and fight over it), they
 * each set their own *layer* here, and `commit()` composes the final result.
 * It's a tiny external store, so React can subscribe with useSyncExternalStore.
 */

export const APP_NAME = 'BeFe Studio'

export type FaviconSpec = { emoji: string } | { letter: string; color?: string }

type HeadLayers = {
  routeTitle: string
  titleOverride: string | null
  routeFavicon: FaviconSpec | null
  faviconOverride: FaviconSpec | null
  description: string | null
  badge: number
  awayMessage: string | null
  flashMessage: string | null
}

export type HeadSnapshot = HeadLayers & { title: string; faviconHref: string }

const DEFAULT_FAVICON: FaviconSpec = { emoji: '⚡' }
const DEFAULT_DESCRIPTION = 'A learning playground for production-grade React patterns.'

let layers: HeadLayers = {
  routeTitle: '',
  titleOverride: null,
  routeFavicon: null,
  faviconOverride: null,
  description: null,
  badge: 0,
  awayMessage: null,
  flashMessage: null,
}

let flashTimer: number | undefined
let flashOn = false
let snapshot: HeadSnapshot
const listeners = new Set<() => void>()

function escapeXml(text: string) {
  return text.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

/** Build an SVG favicon as a data: URL — no image files needed, fully dynamic. */
export function buildFavicon(spec: FaviconSpec, badge = 0): string {
  const body =
    'emoji' in spec
      ? `<text x="32" y="36" font-size="50" text-anchor="middle" dominant-baseline="middle">${escapeXml(spec.emoji)}</text>`
      : `<rect width="64" height="64" rx="16" fill="${escapeXml(spec.color ?? '#4f46e5')}"/>` +
        `<text x="32" y="35" font-size="38" font-weight="700" font-family="system-ui,sans-serif" fill="#fff" text-anchor="middle" dominant-baseline="middle">${escapeXml(spec.letter.slice(0, 1).toUpperCase())}</text>`

  const badgeText = badge > 9 ? '9+' : String(badge)
  const dot =
    badge > 0
      ? `<circle cx="47" cy="17" r="16" fill="#ef4444" stroke="#fff" stroke-width="3"/>` +
        `<text x="47" y="18" font-size="${badge > 9 ? 16 : 21}" font-weight="700" font-family="system-ui,sans-serif" fill="#fff" text-anchor="middle" dominant-baseline="middle">${badgeText}</text>`
      : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}${dot}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function composeTitle(): string {
  if (document.hidden && layers.awayMessage) return layers.awayMessage
  if (flashOn && layers.flashMessage) return layers.flashMessage
  const base = layers.titleOverride ?? layers.routeTitle
  const count = layers.badge > 99 ? '99+' : String(layers.badge)
  const prefix = layers.badge > 0 ? `(${count}) ` : ''
  return prefix + (base ? `${base} · ${APP_NAME}` : APP_NAME)
}

function getIconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

function getMeta(name: string): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  return meta
}

function commit() {
  const title = composeTitle()
  const favicon = layers.faviconOverride ?? layers.routeFavicon ?? DEFAULT_FAVICON
  const faviconHref = buildFavicon(favicon, layers.badge)

  // Only touch the DOM when something actually changed.
  if (document.title !== title) document.title = title
  const link = getIconLink()
  if (link.getAttribute('href') !== faviconHref) {
    link.type = 'image/svg+xml'
    link.setAttribute('href', faviconHref)
  }
  getMeta('description').content = layers.description ?? DEFAULT_DESCRIPTION

  snapshot = { ...layers, title, faviconHref }
  listeners.forEach((listener) => listener())
}

function update(patch: Partial<HeadLayers>) {
  layers = { ...layers, ...patch }
  commit()
}

// ── Public API ───────────────────────────────────────────────────────────

export function setRouteHead(head: { title: string; favicon: FaviconSpec | null; description: string | null }) {
  update({ routeTitle: head.title, routeFavicon: head.favicon, description: head.description })
}

export const setTitleOverride = (title: string | null) => update({ titleOverride: title })
export const setFaviconOverride = (favicon: FaviconSpec | null) => update({ faviconOverride: favicon })
export const setAwayMessage = (message: string | null) => update({ awayMessage: message })

export function setBadge(next: number | ((prev: number) => number)) {
  const value = typeof next === 'function' ? next(layers.badge) : next
  update({ badge: Math.max(0, value) })
}

/** Blink the title until the user comes back to this tab. */
export function flashTitle(message: string) {
  stopFlash()
  if (document.hasFocus()) return
  layers = { ...layers, flashMessage: message }
  flashTimer = window.setInterval(() => {
    flashOn = !flashOn
    commit()
  }, 1000)
  flashOn = true
  commit()
}

export function stopFlash() {
  window.clearInterval(flashTimer)
  flashTimer = undefined
  if (flashOn || layers.flashMessage) {
    flashOn = false
    update({ flashMessage: null })
  }
}

export function subscribeHead(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getHeadSnapshot = () => snapshot

// Re-compose when the tab is hidden/shown; stop flashing once the user is back.
document.addEventListener('visibilitychange', commit)
window.addEventListener('focus', stopFlash)
commit()
