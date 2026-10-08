import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, ConfirmState, Field, TextInput } from '../components/ui.jsx'
import { loginEmail, loginPhone, requestLoginOtp } from '../lib/auth-api.js'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login({ onLogin }) {
  const nav = useNavigate()
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const doEmail = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!emailRe.test(email.trim())) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Enter your password.'
    setErrors(errs); setServerError('')
    if (Object.keys(errs).length) return
    setBusy(true)
    const r = await loginEmail(email.trim(), password)
    setBusy(false)
    if (!r.ok) {
      if (r.needsVerify) { nav(`/verify?phone=${encodeURIComponent(r.phone)}`); return }
      setServerError(r.error); return
    }
    setDone(true)
    onLogin(r.user)
    setTimeout(() => nav('/'), 500)
  }

  const sendCode = async () => {
    setServerError(''); setErrors({})
    if (!phone.trim()) { setErrors({ phone: 'Enter your phone number first.' }); return }
    setBusy(true)
    const r = await requestLoginOtp(phone.trim(), 'recaptcha-login')
    setBusy(false)
    if (!r.ok) { setServerError(r.error); return }
    setOtpSent(true); setDemoOtp(r.demoOtp || '')
  }

  const doPhone = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp.trim())) { setErrors({ otp: 'Enter the 6-digit code.' }); return }
    setBusy(true)
    const r = await loginPhone(phone.trim(), otp.trim())
    setBusy(false)
    if (!r.ok) { setServerError(r.error); return }
    setDone(true)
    onLogin(r.user)
    setTimeout(() => nav('/'), 500)
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900">Log in</h1>
      <p className="mt-1 text-sm text-zinc-600">Email + password, or phone + code.</p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        {done ? (
          <ConfirmState title="Logged in." body="Taking you to your movies…" />
        ) : (
          <>
            <div role="tablist" aria-label="Login method" className="grid grid-cols-2 gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-1 text-sm">
              {['email', 'phone'].map(m => (
                <button
                  key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setServerError(''); setErrors({}) }}
                  className={`rounded px-3 py-2 font-medium ${mode === m ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  {m === 'email' ? 'Email' : 'Phone'}
                </button>
              ))}
            </div>

            {serverError && <div className="mt-4"><Alert tone="error">{serverError}</Alert></div>}

            {mode === 'email' ? (
              <form onSubmit={doEmail} noValidate className="mt-4 space-y-4">
                <Field label="Email" htmlFor="li-email" error={errors.email}>
                  <TextInput id="li-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" error={errors.email} />
                </Field>
                <Field label="Password" htmlFor="li-password" error={errors.password}>
                  <TextInput id="li-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" error={errors.password} />
                </Field>
                <Button disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <Field label="Phone" htmlFor="li-phone" error={errors.phone}>
                  <TextInput id="li-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="+2010…" error={errors.phone} />
                </Field>
                {!otpSent ? (
                  <Button variant="secondary" onClick={sendCode} disabled={busy}>{busy ? 'Sending…' : 'Send SMS code'}</Button>
                ) : (
                  <form onSubmit={doPhone} noValidate className="space-y-4">
                    {demoOtp && <Alert tone="note">Demo code (offline mode): <span className="font-mono font-semibold tracking-widest">{demoOtp}</span></Alert>}
                    <Field label="6-digit code" htmlFor="li-otp" error={errors.otp}>
                      <TextInput id="li-otp" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="••••••" className="text-center font-mono text-lg tracking-[0.3em]" error={errors.otp} />
                    </Field>
                    <Button disabled={busy}>{busy ? 'Verifying…' : 'Verify and log in'}</Button>
                    <button type="button" onClick={sendCode} className="w-full text-sm text-zinc-500 hover:text-rose-700">Resend code</button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div id="recaptcha-login" />
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot" className="text-rose-600 underline underline-offset-4 hover:text-rose-800">Forgot password?</Link>
        <Link to="/signup" className="text-rose-600 underline underline-offset-4 hover:text-rose-800">Create account</Link>
      </div>
    </div>
  )
}
