# BeFe Studio — frontend

A learning playground for the patterns almost every production React app uses.
React 19 · TypeScript · Vite 8 · React Router 7 (data router). No UI library — everything is hand-built so you can read it.

```bash
# Vite 8 needs Node 20.19+ (nvm use 22)
npm install
npm run dev      # http://localhost:5173  — log in with any email + 6-char password
npm run build    # type-check + production build (each page is its own chunk)
```

## Where each concept lives

| Concept | File(s) |
| --- | --- |
| Route config, lazy pages, nested + layout routes, index redirects, 404 | `src/app/router.tsx` |
| Protected routes, login/logout via loaders & actions, safe `redirectTo` | `src/api/auth.ts`, `src/pages/auth/LoginPage.tsx` |
| Loaders, URL search params as state, dynamic `:userId`, thrown 404s | `src/api/users.ts`, `src/pages/users/*` |
| Error boundaries (inside the layout, so the sidebar survives) | `src/pages/RouteErrorPage.tsx` |
| App shell: sidebar, icon rail, mobile drawer, hamburger, Ctrl+B | `src/layouts/AppLayout.tsx`, `src/components/layout/*` |
| Breadcrumbs & tab title from route `handle` | `src/app/routeHandle.ts`, `src/components/head/RouteHead.tsx` |
| Tab title + dynamic favicon + unread badge + away/flash | `src/lib/head.ts`, `src/hooks/useDocumentHead.ts`, `src/pages/TabHeadPage.tsx` |
| Top loading bar, view transitions, scroll restoration | `src/components/layout/NavigationProgress.tsx`, `src/styles/base.css`, `src/layouts/RootLayout.tsx` |
| Theme (light/dark/system) with no flash on load | `index.html` (inline script), `src/app/ThemeProvider.tsx` |
| Unsaved-changes guard (`useBlocker` + `beforeunload`) | `src/pages/settings/ProfileSettingsPage.tsx` |
| Passing data to child routes (`<Outlet context>`) | `src/layouts/appShell.ts`, `src/pages/settings/*` |
| Toasts, native `<dialog>` confirm | `src/lib/toast.ts`, `src/components/ui/*` |
| Design tokens / theming | `src/styles/tokens.css` |

## Reusable form components — `src/components/form`

All share `FieldShell` (label, required/optional, helper, error, counter) and `useFieldIds` (ARIA wiring).

- **InputField** — every native `<input>` prop plus prefix/suffix, clearable, counter, password reveal + Caps Lock warning, loading, sizes, controlled *and* uncontrolled (`ref`).
- **TimeInputField** — type `930pm` / `21:30` or pick from columns; ↑/↓ steps; 12h/24h; `min`/`max`; value is `"HH:mm"`.
- **DateTimeInputField** — keyboard calendar grid + time columns; `showTime={false}` for date-only; `min`/`max`; value is `"YYYY-MM-DDTHH:mm"` (local, no timezone bugs).
- **Dropdown** — single/multi (generic value type), search with highlight, groups, typeahead, max selections, async loading, chips.

Pickers and menus render in a portal (`components/ui/Popover.tsx` + `hooks/usePopover.ts`) so `overflow: hidden` parents never clip them, and they flip upward when there's no room below.

Every field accepts `name` and emits hidden inputs, so it also works inside a plain `<form>` or React Router `<Form>`.
