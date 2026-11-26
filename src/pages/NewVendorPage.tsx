import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import { CATEGORIES, type NewVendorInput } from '../types'

type Errors = Partial<Record<keyof NewVendorInput | 'form', string>>

export function validateVendor(v: NewVendorInput): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Enter the vendor’s name (at least 2 characters).'
  if (!v.category) e.category = 'Choose a category.'
  if (!v.country.trim()) e.country = 'Enter the country the vendor is based in.'
  if (!/^\S+@\S+\.\S+$/.test(v.owner)) e.owner = 'Enter the owner’s email, like name@company.com.'
  return e
}

const FIELD_ORDER: (keyof NewVendorInput)[] = ['name', 'category', 'country', 'owner']

export default function NewVendorPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<NewVendorInput>({ name: '', category: '', country: '', owner: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const set = (key: keyof NewVendorInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  function focusFirstError(errs: Errors) {
    const first = FIELD_ORDER.find((k) => errs[k])
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const clientErrors = validateVendor(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return focusFirstError(clientErrors)
    setSubmitting(true)
    try {
      const created = await api.addVendor(session?.token ?? null, values)
      navigate(`/vendors/${created.id}`)
    } catch (err) {
      const apiErr = err as api.ApiError
      const next: Errors = apiErr.fieldErrors ?? { form: apiErr.message }
      setErrors(next)
      focusFirstError(next)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (key: keyof NewVendorInput, label: string, input: 'text' | 'email' | 'select') => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      {input === 'select' ? (
        <select
          id={key} name={key} value={values[key]} onChange={set(key)}
          aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined}
        >
          <option value="">Choose…</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      ) : (
        <input
          id={key} name={key} type={input} value={values[key]} onChange={set(key)}
          aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined}
        />
      )}
      {errors[key] && <p id={`${key}-error`} className="field-error">{errors[key]}</p>}
    </div>
  )

  return (
    <>
      <div className="page-head"><h1>Add vendor</h1></div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="narrow">
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        {field('name', 'Vendor name', 'text')}
        {field('category', 'Category', 'select')}
        {field('country', 'Country', 'text')}
        {field('owner', 'Relationship owner email', 'email')}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding vendor…' : 'Add vendor'}
        </button>
      </form>
    </>
  )
}
