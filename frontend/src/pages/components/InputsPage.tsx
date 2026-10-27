import { useRef, useState } from 'react'
import { InputField } from '../../components/form'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { DemoCard, PageHeader } from '../../components/ui/Page'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function InputsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [amount, setAmount] = useState('2500')
  const [bio, setBio] = useState('Full-stack dev learning production React.')
  const [search, setSearch] = useState('')
  const [password, setPassword] = useState('')
  const uncontrolledRef = useRef<HTMLInputElement>(null)
  const [readBack, setReadBack] = useState<string | null>(null)

  // "Validate on blur, re-validate on change" — don't yell while the user is still typing.
  const emailError = emailTouched && email && !EMAIL_RE.test(email) ? 'Enter a valid email address' : undefined
  const strength = passwordStrength(password)

  return (
    <>
      <PageHeader
        title="InputField"
        description={
          <>
            One component, every common case. Source: <code>src/components/form/InputField.tsx</code>
          </>
        }
      />

      <div className="demo-grid">
        <DemoCard title="Basic" description="Label, placeholder and helper text, all wired up with ARIA." value={name}>
          <InputField label="Full name" placeholder="Ada Lovelace" helperText="As it appears on your ID." value={name} onChange={(e) => setName(e.target.value)} />
        </DemoCard>

        <DemoCard title="Validation" description="Validates on blur, then live. Error replaces the helper text." value={email}>
          <InputField
            label="Work email"
            type="email"
            required
            placeholder="you@company.com"
            autoComplete="email"
            prefix={<Icon name="mail" size={16} />}
            helperText="We'll never share it."
            value={email}
            error={emailError}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
          />
        </DemoCard>

        <DemoCard title="Prefix & suffix" description="Text or icons inside the box. Clicking the prefix focuses the input." value={amount}>
          <div className="form-stack">
            <InputField
              label="Amount"
              inputMode="decimal"
              prefix="₹"
              suffix="INR"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            />
            <InputField label="Website" optional prefix="https://" suffix=".com" placeholder="your-site" />
          </div>
        </DemoCard>

        <DemoCard title="Clearable & counter" description="✕ appears only when there's text. Counter turns amber at the limit." value={bio}>
          <InputField label="Headline" clearable showCount maxLength={60} value={bio} onChange={(e) => setBio(e.target.value)} />
        </DemoCard>

        <DemoCard title="Search" description="type=search with an icon, clear button and a loading spinner." value={search}>
          <InputField
            label="Search"
            hideLabel
            type="search"
            placeholder="Search anything…"
            prefix={<Icon name="search" size={16} />}
            clearable
            loading={search.length > 0 && search.length < 3}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            helperText={search.length > 0 && search.length < 3 ? 'Keep typing…' : 'Label is visually hidden but read by screen readers.'}
          />
        </DemoCard>

        <DemoCard title="Password" description="Show/hide toggle and a Caps Lock warning (turn Caps Lock on and type).">
          <div className="form-stack">
            <InputField
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Icon name="lock" size={16} />}
            />
            <div className="strength" data-score={strength.score} aria-live="polite">
              <div className="strength__bar">
                <span />
                <span />
                <span />
                <span />
              </div>
              <span className="strength__label">{password ? strength.label : 'Use 8+ chars, a number and a symbol'}</span>
            </div>
          </div>
        </DemoCard>

        <DemoCard title="States" description="Disabled, read-only and loading.">
          <div className="form-stack">
            <InputField label="Disabled" disabled defaultValue="Can't touch this" />
            <InputField label="Read-only" readOnly defaultValue="ID-48213 (copyable, not editable)" />
            <InputField label="Checking username" defaultValue="amar" loading suffix={<span className="muted">checking…</span>} />
          </div>
        </DemoCard>

        <DemoCard title="Sizes" description="sm · md · lg — same API.">
          <div className="form-stack">
            <InputField label="Small" size="sm" placeholder="size='sm'" />
            <InputField label="Medium" placeholder="size='md' (default)" />
            <InputField label="Large" size="lg" placeholder="size='lg'" />
          </div>
        </DemoCard>

        <DemoCard
          title="Uncontrolled + ref"
          description="No state at all: defaultValue + a ref. Great for big forms where you read values on submit."
          value={readBack ?? undefined}
        >
          <div className="form-stack">
            <InputField ref={uncontrolledRef} label="Nickname" defaultValue="amar" clearable showCount maxLength={20} />
            <div className="row">
              <Button size="sm" onClick={() => uncontrolledRef.current?.focus()}>
                Focus via ref
              </Button>
              <Button size="sm" onClick={() => setReadBack(uncontrolledRef.current?.value ?? '')}>
                Read value
              </Button>
            </div>
          </div>
        </DemoCard>
      </div>
    </>
  )
}

function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const label = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score]!
  return { score, label }
}
