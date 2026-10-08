import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, ConfirmState, Field, TextInput } from '../components/ui.jsx'
import { signup } from '../lib/auth-api.js'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Signup() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setFieldErrors({ ...fieldErrors, [k]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Enter your full name.'
    if (!emailRe.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (form.password.length < 6) errs.password = 'Use at least 6 characters.'
    if (!form.phone.trim()) errs.phone = 'Enter your phone number.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    const r = await signup(form)
    setLoading(false)
    if (!r.ok) { setServerError(r.error); return }
    setDone(true)
    setTimeout(() => {
      nav(`/verify?phone=${encodeURIComponent(form.phone)}`)
    }, 600)
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900">Create account</h1>
      <p className="mt-1 text-sm text-zinc-600">Name, email, password and phone. We verify your phone with a code.</p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        {done ? (
          <ConfirmState title="Account created." body="Sending you to phone verification…" />
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}
            <Field label="Full name" htmlFor="su-name" error={fieldErrors.name}>
              <TextInput id="su-name" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Jane Doe" error={fieldErrors.name} />
            </Field>
            <Field label="Email" htmlFor="su-email" error={fieldErrors.email}>
              <TextInput id="su-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="jane@example.com" error={fieldErrors.email} />
            </Field>
            <Field label="Password" htmlFor="su-password" error={fieldErrors.password} hint="At least 6 characters.">
              <TextInput id="su-password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="••••••••" error={fieldErrors.password} />
            </Field>
            <Field label="Phone" htmlFor="su-phone" error={fieldErrors.phone} hint="Verification code goes here via WhatsApp.">
              <TextInput id="su-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+2010…" error={fieldErrors.phone} />
            </Field>
            <Button disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</Button>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-zinc-600">
        Have an account? <Link to="/login" className="font-medium text-rose-600 underline underline-offset-4 hover:text-rose-800">Log in</Link>
      </p>
    </div>
  )
}
