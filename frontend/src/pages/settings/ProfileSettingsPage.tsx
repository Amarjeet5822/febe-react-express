import { useEffect, useState, type FormEvent } from 'react'
import { useBlocker, useRouteLoaderData } from 'react-router'
import type { requireUserLoader, User } from '../../api/auth'
import { DateTimeInputField, Dropdown, InputField, TimeInputField, type DropdownOption } from '../../components/form'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Icon } from '../../components/ui/Icon'
import { toDateKey, toDateTimeString } from '../../lib/datetime'
import { toast } from '../../lib/toast'
import { sleep } from '../../lib/utils'

type Profile = {
  name: string
  email: string
  phone: string
  role: string | null
  skills: string[]
  timezone: string | null
  workStart: string | null
  workEnd: string | null
  birthday: string | null
  nextReview: string | null
}
type Errors = Partial<Record<keyof Profile, string>>

const STORAGE_KEY = 'befe:profile'

const ROLE_OPTIONS: DropdownOption[] = [
  { value: 'frontend', label: 'Frontend engineer' },
  { value: 'backend', label: 'Backend engineer' },
  { value: 'fullstack', label: 'Full-stack engineer' },
  { value: 'design', label: 'Product designer' },
]
const SKILL_OPTIONS: DropdownOption[] = ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Docker', 'AWS', 'Testing', 'CSS'].map(
  (s) => ({ value: s.toLowerCase(), label: s }),
)
const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: 'Asia/Kolkata', label: 'India (IST)', description: 'UTC+05:30', group: 'Asia' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', description: 'UTC+04:00', group: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', description: 'UTC+08:00', group: 'Asia' },
  { value: 'Europe/London', label: 'London (GMT/BST)', description: 'UTC+00:00', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', description: 'UTC+01:00', group: 'Europe' },
  { value: 'America/New_York', label: 'New York (ET)', description: 'UTC−05:00', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PT)', description: 'UTC−08:00', group: 'Americas' },
]

function loadProfile(user: User): Profile {
  const fallback: Profile = {
    name: user.name,
    email: user.email,
    phone: '',
    role: 'fullstack',
    skills: ['react', 'node.js'],
    timezone: 'Asia/Kolkata',
    workStart: '10:00',
    workEnd: '19:00',
    birthday: null,
    nextReview: null,
  }
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return fallback
  }
}

function validate(p: Profile): Errors {
  const errors: Errors = {}
  if (p.name.trim().length < 2) errors.name = 'Name must be at least 2 characters'
  if (!/^\S+@\S+\.\S+$/.test(p.email)) errors.email = 'Enter a valid email address'
  if (p.phone && !/^\d{10}$/.test(p.phone)) errors.phone = 'Phone must be 10 digits'
  if (!p.role) errors.role = 'Choose a role'
  if (p.skills.length === 0) errors.skills = 'Pick at least one skill'
  if (!p.timezone) errors.timezone = 'Choose your timezone'
  if (!p.workStart) errors.workStart = 'Required'
  if (!p.workEnd) errors.workEnd = 'Required'
  else if (p.workStart && p.workEnd <= p.workStart) errors.workEnd = 'Must be after start'
  return errors
}

/**
 * A realistic settings form: client-side validation, focus on the first error,
 * saving state, toast feedback — and an unsaved-changes guard using
 * useBlocker (in-app navigation) + beforeunload (closing/reloading the tab).
 */
export default function ProfileSettingsPage() {
  const { user } = useRouteLoaderData<typeof requireUserLoader>('app')!
  const [saved, setSaved] = useState(() => loadProfile(user))
  const [form, setForm] = useState(saved)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  /** Update one field and clear its error as soon as the user fixes it. */
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    const firstInvalid = Object.keys(nextErrors)[0]
    if (firstInvalid) {
      document.getElementById(`profile-${firstInvalid}`)?.focus()
      toast('Please fix the highlighted fields', { tone: 'error' })
      return
    }
    setSaving(true)
    await sleep(700)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(form)
    setSaving(false)
    toast('Profile saved', { description: 'Your changes are stored in localStorage.' })
  }

  const now = new Date()

  return (
    <form className="card settings-panel" onSubmit={onSubmit} noValidate>
      <h2 className="settings-panel__title">Profile</h2>
      <p className="muted">Every reusable field in one real form. Change something, then click another menu item.</p>

      <div className="form-grid">
        <InputField id="profile-name" label="Full name" required value={form.name} error={errors.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
        <InputField
          id="profile-email"
          label="Email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          onChange={(e) => set('email', e.target.value)}
          prefix={<Icon name="mail" size={16} />}
          autoComplete="email"
        />
        <InputField
          id="profile-phone"
          label="Phone"
          optional
          inputMode="numeric"
          prefix="+91"
          maxLength={10}
          showCount
          value={form.phone}
          error={errors.phone}
          onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))}
          autoComplete="tel-national"
        />
        <Dropdown id="profile-role" label="Role" required options={ROLE_OPTIONS} value={form.role} error={errors.role} onChange={(v) => set('role', v)} />
        <Dropdown
          id="profile-skills"
          label="Skills"
          required
          multiple
          searchable
          options={SKILL_OPTIONS}
          value={form.skills}
          error={errors.skills}
          onChange={(v) => set('skills', v)}
        />
        <Dropdown
          id="profile-timezone"
          label="Timezone"
          required
          searchable
          options={TIMEZONE_OPTIONS}
          value={form.timezone}
          error={errors.timezone}
          onChange={(v) => set('timezone', v)}
        />
        <TimeInputField id="profile-workStart" label="Work starts" required value={form.workStart} error={errors.workStart} onChange={(v) => set('workStart', v)} />
        <TimeInputField
          id="profile-workEnd"
          label="Work ends"
          required
          value={form.workEnd}
          min={form.workStart ?? undefined}
          error={errors.workEnd}
          onChange={(v) => set('workEnd', v)}
        />
        <DateTimeInputField id="profile-birthday" label="Birthday" optional showTime={false} openTo="years" max={toDateKey(now)} value={form.birthday} onChange={(v) => set('birthday', v)} />
        <DateTimeInputField
          id="profile-nextReview"
          label="Next 1:1"
          optional
          min={toDateTimeString(now)}
          value={form.nextReview}
          onChange={(v) => set('nextReview', v)}
        />
      </div>

      <div className="form-actions">
        {isDirty && <span className="unsaved">Unsaved changes</span>}
        <Button variant="ghost" disabled={!isDirty || saving} onClick={() => (setForm(saved), setErrors({}))}>
          Discard
        </Button>
        <Button type="submit" variant="primary" loading={saving} disabled={!isDirty}>
          Save changes
        </Button>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        description="You have unsaved changes on your profile. They will be lost."
        confirmLabel="Leave page"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </form>
  )
}
