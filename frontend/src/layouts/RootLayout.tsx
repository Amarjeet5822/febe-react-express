import { Outlet, ScrollRestoration } from 'react-router'
import { RouteHead } from '../components/head/RouteHead'
import { NavigationProgress } from '../components/layout/NavigationProgress'
import { Toaster } from '../components/ui/Toaster'

/** Wraps *every* route (login and app alike): global, invisible-ish plumbing. */
export default function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <RouteHead />
      <Outlet />
      <Toaster />
      {/* Restores scroll position on back/forward, scrolls to top on new pages */}
      <ScrollRestoration />
    </>
  )
}
