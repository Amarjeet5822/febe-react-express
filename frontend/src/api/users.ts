import { data, type LoaderFunctionArgs } from 'react-router'
import { sleep } from '../lib/utils'

/*
 * Mock users "API". Loaders run *before* the route renders, so pages never
 * deal with loading spinners for their primary data — the router waits,
 * and <NavigationProgress /> shows the bar meanwhile.
 */

export type UserRole = 'Admin' | 'Editor' | 'Viewer'
export type UserStatus = 'active' | 'invited' | 'suspended'
export type AppUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  team: string
  joinedAt: string
}

const NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Mehta', 'Ananya Iyer', 'Vikram Singh',
  'Sneha Reddy', 'Arjun Nair', 'Kavya Joshi', 'Ishaan Gupta', 'Meera Kapoor',
  'Aditya Rao', 'Diya Banerjee', 'Kabir Malhotra', 'Riya Desai', 'Siddharth Jain',
  'Tara Menon', 'Neil Fernandes', 'Zoya Khan', 'Dev Chatterjee', 'Pooja Verma',
]
const ROLES: UserRole[] = ['Admin', 'Editor', 'Viewer', 'Viewer', 'Editor']
const STATUSES: UserStatus[] = ['active', 'active', 'invited', 'active', 'suspended']
const TEAMS = ['Platform', 'Growth', 'Design', 'Payments']

const USERS: AppUser[] = NAMES.map((name, i) => ({
  id: String(i + 1),
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@befe.dev`,
  role: ROLES[i % ROLES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  team: TEAMS[i % TEAMS.length]!,
  joinedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i * 3) % 27 + 1).padStart(2, '0')}`,
}))

export async function listUsers(query: string): Promise<AppUser[]> {
  await sleep(350)
  const q = query.trim().toLowerCase()
  if (!q) return USERS
  return USERS.filter((u) => [u.name, u.email, u.team, u.role].some((field) => field.toLowerCase().includes(q)))
}

export async function getUser(id: string): Promise<AppUser | null> {
  await sleep(300)
  return USERS.find((u) => u.id === id) ?? null
}

// ── Loaders ──────────────────────────────────────────────────────────────

/** /users?q=… — the search query lives in the URL, so it survives reload & is shareable. */
export async function usersLoader({ request }: LoaderFunctionArgs) {
  const q = new URL(request.url).searchParams.get('q') ?? ''
  return { users: await listUsers(q), q }
}

export async function userLoader({ params }: LoaderFunctionArgs) {
  const user = await getUser(params.userId ?? '')
  // Throwing a Response-like error renders the nearest ErrorBoundary with status 404.
  if (!user) throw data(`No user with id “${params.userId}”`, { status: 404 })
  return { user }
}

export type UserLoaderData = Awaited<ReturnType<typeof userLoader>>
