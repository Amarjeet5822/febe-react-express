import { Form, useActionData, useNavigation, useSearchParams } from 'react-router'
import type { LoginActionData } from '../../api/auth'
import { InputField } from '../../components/form'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'

/**
 * <Form method="post"> submits to this route's `action` (api/auth.ts → loginAction).
 * No useState, no onSubmit, no fetch: the router handles pending state,
 * returns validation errors via useActionData, and redirects on success.
 */
export default function LoginPage() {
  const actionData = useActionData() as LoginActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const submitting = navigation.state === 'submitting'
  const errors = actionData?.errors

  return (
    <div className="auth">
      <div className="auth__card card">
        <div className="auth__brand">
          <span className="sidebar__logo">⚡</span>
          <span>BeFe Studio</span>
        </div>
        <h1 className="auth__title">Sign in</h1>
        <p className="auth__subtitle">Any email + a 6-character password works — this is a mock.</p>

        <Form method="post" className="form-stack" noValidate>
          <input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? '/'} />
          <InputField
            name="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            autoFocus
            required
            prefix={<Icon name="mail" size={16} />}
            error={errors?.email}
          />
          <InputField
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            prefix={<Icon name="lock" size={16} />}
            error={errors?.password}
            labelAction={
              <a href="#" className="auth__link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            }
          />
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Form>
      </div>
    </div>
  )
}
