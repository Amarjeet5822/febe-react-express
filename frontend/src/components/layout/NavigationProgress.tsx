import { useState } from 'react'
import { useNavigation } from 'react-router'

/**
 * YouTube/GitHub-style loading bar at the top of the page.
 * `useNavigation()` tells us when the router is loading a lazy route chunk,
 * running a loader, or submitting a form.
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'

  // "Remember a value from a previous render" — React's recommended pattern,
  // so the finishing animation only plays after something actually loaded.
  const [hasLoaded, setHasLoaded] = useState(false)
  if (busy && !hasLoaded) setHasLoaded(true)

  const state = busy ? 'loading' : hasLoaded ? 'done' : 'idle'
  return <div className="nav-progress" data-state={state} aria-hidden="true" />
}
