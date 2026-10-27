import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { toast } from '../lib/toast'
import { safeRedirect, sleep } from '../lib/utils'

/*
 * Fake auth stored in localStorage so the routing patterns (protected routes,
 * redirect-after-login, logout action) can be learned without a backend.
 * Later: replace these functions with fetch() calls to the Express API.
 */

export type User = { name: string; email: string }

const STORAGE_KEY = 'befe:user'

export function getCurrentUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as User | null
  } catch {
    return null
  }
}

function nameFromEmail(email: string) {
  return email
    .split('@')[0]!
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ')
}

// ── Route guards / loaders / actions ─────────────────────────────────────

/** Loader for the protected app layout: no user → bounce to /login?redirectTo=… */
export function requireUserLoader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser()
  if (!user) {
    const { pathname, search } = new URL(request.url)
    const params = new URLSearchParams({ redirectTo: pathname + search })
    throw redirect(`/login?${params}`)
  }
  return { user }
}

/** Already signed in? Skip the login page. */
export function loginLoader() {
  return getCurrentUser() ? redirect('/') : null
}

export type LoginActionData = { errors: { email?: string; password?: string } }

/** Handles the <Form method="post"> on the login page. */
export async function loginAction({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')

  const errors: LoginActionData['errors'] = {}
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address'
  if (password.length < 6) errors.password = 'Password must be at least 6 characters'
  if (Object.keys(errors).length) return { errors } satisfies LoginActionData

  await sleep(600) // pretend network
  const user: User = { email, name: nameFromEmail(email) || 'Friend' }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  toast(`Welcome, ${user.name}!`)
  return redirect(safeRedirect(String(form.get('redirectTo') ?? '')))
}

export function logoutAction() {
  localStorage.removeItem(STORAGE_KEY)
  toast('Signed out', { tone: 'info' })
  return redirect('/login')
}
