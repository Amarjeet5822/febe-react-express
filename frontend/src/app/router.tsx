import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { loginAction, loginLoader, logoutAction, requireUserLoader } from '../api/auth'
import { userLoader, usersLoader, type UserLoaderData } from '../api/users'
import AppLayout from '../layouts/AppLayout'
import RootLayout from '../layouts/RootLayout'
import RouteErrorPage from '../pages/RouteErrorPage'
import type { RouteHandle } from './routeHandle'

/**
 * Code-splitting helper: the page's JS is only downloaded the first time its
 * route is visited. Each page lives in its own chunk in the production build.
 */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const handle = (h: RouteHandle) => h

export const router = createBrowserRouter([
  {
    id: 'root',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: () => null,
    children: [
      // ── Public routes ───────────────────────────────────────────────
      {
        path: 'login',
        loader: loginLoader,
        action: loginAction,
        lazy: page(() => import('../pages/auth/LoginPage')),
        handle: handle({ title: 'Sign in', favicon: { emoji: '🔐' } }),
      },
      // An action-only route: <Form method="post" action="/logout">
      { path: 'logout', action: logoutAction },

      // ── Protected app (layout route: no path, just wraps children) ──
      {
        id: 'app',
        loader: requireUserLoader,
        Component: AppLayout,
        ErrorBoundary: RouteErrorPage,
        handle: handle({ crumb: 'Home' }),
        children: [
          {
            // Pathless route whose only job is an error boundary *inside* the layout:
            // a failing page shows the error while the sidebar & topbar stay usable.
            ErrorBoundary: RouteErrorPage,
            children: [
              {
                index: true,
                lazy: page(() => import('../pages/DashboardPage')),
                handle: handle({ title: 'Dashboard', favicon: { emoji: '📊' } }),
              },
              {
                path: 'components',
                handle: handle({ crumb: 'Components' }),
                children: [
                  { index: true, element: <Navigate to="inputs" replace /> },
                  {
                    path: 'inputs',
                    lazy: page(() => import('../pages/components/InputsPage')),
                    handle: handle({ title: 'Input Field', crumb: 'Input Field', favicon: { emoji: '⌨️' } }),
                  },
                  {
                    path: 'date-time',
                    lazy: page(() => import('../pages/components/DateTimePage')),
                    handle: handle({ title: 'Date & Time', crumb: 'Date & Time', favicon: { emoji: '🗓️' } }),
                  },
                  {
                    path: 'dropdown',
                    lazy: page(() => import('../pages/components/DropdownPage')),
                    handle: handle({ title: 'Dropdown', crumb: 'Dropdown', favicon: { emoji: '🔽' } }),
                  },
                ],
              },
              {
                path: 'users',
                handle: handle({ crumb: 'Users', favicon: { emoji: '👥' } }),
                children: [
                  {
                    index: true,
                    loader: usersLoader,
                    lazy: page(() => import('../pages/users/UsersPage')),
                    handle: handle({ title: 'Users' }),
                  },
                  {
                    // Dynamic segment → params.userId; title/crumb come from loader data
                    path: ':userId',
                    loader: userLoader,
                    lazy: page(() => import('../pages/users/UserDetailPage')),
                    handle: handle({
                      title: (d: UserLoaderData) => d.user.name,
                      crumb: (d: UserLoaderData) => d.user.name,
                    }),
                  },
                ],
              },
              {
                path: 'tab-head',
                lazy: page(() => import('../pages/TabHeadPage')),
                handle: handle({ title: 'Tab title & icon', crumb: 'Tab title & icon', favicon: { emoji: '🧭' } }),
              },
              {
                // Nested layout: settings has its own tab bar + <Outlet />
                path: 'settings',
                lazy: page(() => import('../pages/settings/SettingsLayout')),
                handle: handle({ title: 'Settings', crumb: 'Settings', favicon: { emoji: '⚙️' } }),
                children: [
                  { index: true, element: <Navigate to="profile" replace /> },
                  {
                    path: 'profile',
                    lazy: page(() => import('../pages/settings/ProfileSettingsPage')),
                    handle: handle({ title: 'Profile settings', crumb: 'Profile' }),
                  },
                  {
                    path: 'appearance',
                    lazy: page(() => import('../pages/settings/AppearanceSettingsPage')),
                    handle: handle({ title: 'Appearance', crumb: 'Appearance' }),
                  },
                ],
              },
              {
                // Catch-all 404 *inside* the layout, so the sidebar stays visible
                path: '*',
                lazy: page(() => import('../pages/NotFoundPage')),
                handle: handle({ title: 'Page not found', favicon: { emoji: '🤷' } }),
              },
            ],
          },
        ],
      },
    ],
  },
])
