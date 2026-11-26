import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'

type Errors = { email?: string; password?: string; form?: string }

export function validateLogin(email: string, password: string): Errors {
  const errors: Errors = {}
  if (!email.trim()) errors.email = 'Enter your email address.'
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter an email like name@company.com.'
  if (!password) errors.password = 'Enter your password.'
  else if (password.length < 8) errors.password = 'Your password has at least 8 characters.'
  return errors
}

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/vendors'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const clientErrors = validateLogin(email, password)
    setErrors(clientErrors)
    if (clientErrors.email || clientErrors.password) return
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      // Server-aware validation: show the server's message next to the field it names.
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors)
      else setErrors({ form: 'We couldn’t sign you in. Try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <h1>Sign in</h1>
      <p className="muted">Demo account: analyst@certa.demo / password123</p>
      <form onSubmit={onSubmit} noValidate>
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        <div className="field">
          <label htmlFor="email">Work email</label>
          <input
            id="email" type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
