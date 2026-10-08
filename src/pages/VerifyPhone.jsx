import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, ConfirmState, Field, TextInput } from '../components/ui.jsx'
import { requestVerifyOtp, confirmVerifyOtp } from '../lib/auth-api.js'
import { USE_BACKEND } from '../lib/api-client.js'

export default function VerifyPhone({ onVerified }) {
  const [params] = useSearchParams()
  const phone = params.get('phone') || ''
  const nav = useNavigate()
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (sent || !phone) return
    let alive = true
    requestVerifyOtp(phone, 'recaptcha-verify').then(r => {
      if (!alive) return
      if (r.ok) { setSent(true); setDemoOtp(r.demoOtp || '') }
      else setServerError(r.error)
    })
    return () => { alive = false }
  }, [phone, sent])

  const resend = async () => {
    setServerError('')
    setBusy(true)
    const r = await requestVerifyOtp(phone, 'recaptcha-verify')
    setBusy(false)
    if (!r.ok) setServerError(r.error)
    else { setSent(true); setDemoOtp(r.demoOtp || '') }
  }

  const submit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!/^\d{6}$/.test(otp.trim())) { setFieldError('Enter the 6-digit code.'); return }
    setFieldError('')
    setBusy(true)
    const r = await confirmVerifyOtp(otp.trim(), phone)
    setBusy(false)
    if (!r.ok) { setServerError(r.error); return }
    onVerified(r.user)
    setDone(true)
    setTimeout(() => nav('/'), 700)
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900">Verify phone</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Code sent by SMS to <span className="font-medium text-zinc-900">{phone || 'your phone'}</span>
      </p>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
        {done ? (
          <ConfirmState title="Phone verified." body="Taking you to your movies…" />
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            {!sent && USE_BACKEND && <Alert tone="info">Sending SMS… if no code arrives, use Resend below.</Alert>}
            {demoOtp && <Alert tone="note">Demo code (offline mode): <span className="font-mono font-semibold tracking-widest">{demoOtp}</span></Alert>}
            {serverError && <Alert tone="error">{serverError}</Alert>}
            <Field label="6-digit code" htmlFor="vf-otp" error={fieldError}>
              <TextInput id="vf-otp" inputMode="numeric" maxLength={6} value={otp} onChange={e => { setOtp(e.target.value); setFieldError('') }} placeholder="••••••" className="text-center font-mono text-lg tracking-[0.3em]" error={fieldError} />
            </Field>
            <Button disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</Button>
            <Button variant="secondary" type="button" onClick={resend} disabled={busy}>
              Resend SMS code
            </Button>
          </form>
        )}
      </div>
      <div id="recaptcha-verify" />
    </div>
  )
}
