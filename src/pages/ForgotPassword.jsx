import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, ConfirmState, Field, TextInput } from '../components/ui.jsx'
import { requestPasswordReset, resetPassword } from '../lib/auth-api.js'

export default function ForgotPassword() {
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [pw, setPw] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const request = async () => {
    setServerError(''); setErrors({})
    if (!phone.trim()) { setErrors({ phone: 'Enter your registered phone number.' }); return }
    setBusy(true)
    const r = await requestPasswordReset(phone.trim(), 'recaptcha-forgot')
    setBusy(false)
    if (!r.ok) { setServerError(r.error); return }
    setDemoOtp(r.demoOtp || ''); setStep(2)
  }

  const reset = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!/^\d{6}$/.test(otp.trim())) errs.otp = 'Enter the 6-digit code.'
    if (pw.length < 6) errs.pw = 'Use at least 6 characters.'
    setErrors(errs); setServerError('')
    if (Object.keys(errs).length) return
    setBusy(true)
    const r = await resetPassword(phone.trim(), otp.trim(), pw)
    setBusy(false)
    if (!r.ok) { setServerError(r.error); return }
    setDone(true)
    setTimeout(() => nav('/login'), 900)
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900">Reset password</h1>
      <p className="mt-1 text-sm text-zinc-600">Step {step} of 2 · phone, then code and new password.</p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        {done ? (
          <ConfirmState title="Password updated." body="Taking you back to log in…" />
        ) : step === 1 ? (
          <div className="space-y-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}
            <Field label="Phone" htmlFor="fp-phone" error={errors.phone}>
              <TextInput id="fp-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+2010…" error={errors.phone} />
            </Field>
            <Button onClick={request} disabled={busy}>{busy ? 'Sending…' : 'Send SMS code'}</Button>
          </div>
        ) : (
          <form onSubmit={reset} noValidate className="space-y-4">
            {demoOtp && <Alert tone="note">Demo code (offline mode): <span className="font-mono font-semibold tracking-widest">{demoOtp}</span></Alert>}
            {serverError && <Alert tone="error">{serverError}</Alert>}
            <Field label="6-digit code" htmlFor="fp-otp" error={errors.otp}>
              <TextInput id="fp-otp" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="••••••" className="text-center font-mono text-lg tracking-[0.3em]" error={errors.otp} />
            </Field>
            <Field label="New password" htmlFor="fp-pw" error={errors.pw}>
              <TextInput id="fp-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" placeholder="••••••••" error={errors.pw} />
            </Field>
            <Button disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
          </form>
        )}
      </div>
      <div id="recaptcha-forgot" />
      <p className="mt-4 text-center text-sm">
        <Link to="/login" className="text-rose-600 underline underline-offset-4 hover:text-rose-800">Back to log in</Link>
      </p>
    </div>
  )
}
