import { useOutletContext } from 'react-router'

/*
 * Values the app layout shares with every page rendered inside its <Outlet />.
 * `<Outlet context={…}>` + `useOutletContext()` is React Router's built-in way
 * to pass data down to child routes without a separate React context.
 */
export type AppShellContext = {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export function useAppShell() {
  return useOutletContext<AppShellContext>()
}
