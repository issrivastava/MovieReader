// Mock auth layer (localStorage) — swap with real backend later.
// Backend contract to implement later:
// POST /api/auth/signup {name,email,password,phone} -> {userId, otpSent:true}
// POST /api/auth/verify-otp {phone, otp} -> {token, user}
// POST /api/auth/login {email,password} OR {phone, otp}
// POST /api/auth/forgot/request {phone} -> {otpSent:true}
// POST /api/auth/forgot/reset {phone, otp, newPassword}

const USERS_KEY = 'mr_users'
const SESSION_KEY = 'mr_session'
const OTP_KEY = 'mr_otps'

const read = (k, fb) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : fb
  } catch { return fb }
}
const writeLS = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export function getUsers() { return read(USERS_KEY, []) }
export function getSession() { return read(SESSION_KEY, null) }
export function setSession(s) { s ? writeLS(SESSION_KEY, s) : localStorage.removeItem(SESSION_KEY) }
export function logout() { localStorage.removeItem(SESSION_KEY) }

function makeOtp() { return String(Math.floor(100000 + Math.random() * 900000)) }

export function sendOtp(phone, purpose = 'verify') {
  const otps = read(OTP_KEY, {})
  const code = makeOtp()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 min
  otps[phone] = { code, expiresAt, purpose, attempts: 0 }
  writeLS(OTP_KEY, otps)
  // In production this would SMS the code. For demo we return it so UI can display it.
  return { code, expiresAt }
}

export function peekOtp(phone) { return read(OTP_KEY, {})[phone] || null }

export function verifyOtp(phone, code) {
  const otps = read(OTP_KEY, {})
  const entry = otps[phone]
  if (!entry) return { ok: false, error: 'No OTP requested. Tap Resend.' }
  if (Date.now() > entry.expiresAt) return { ok: false, error: 'OTP expired. Please resend.' }
  if (String(code).trim() !== entry.code) return { ok: false, error: 'Incorrect OTP. Try again.' }
  delete otps[phone]
  writeLS(OTP_KEY, otps)
  return { ok: true }
}

export function signup({ name, email, password, phone }) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, error: 'Email already registered. Try logging in.' }
  if (users.find(u => u.phone === phone))
    return { ok: false, error: 'Phone already registered. Try logging in.' }
  const user = { id: crypto.randomUUID(), name, email, phone, password, verified: false, createdAt: Date.now() }
  users.push(user)
  writeLS(USERS_KEY, users)
  const { code, expiresAt } = sendOtp(phone, 'verify')
  return { ok: true, user: { ...user, password: undefined }, demoOtp: code, expiresAt }
}

export function markVerified(phone) {
  const users = getUsers()
  const u = users.find(x => x.phone === phone)
  if (!u) return null
  u.verified = true
  writeLS(USERS_KEY, users)
  const safe = { ...u }; delete safe.password
  setSession({ user: safe, token: 'mock-token-' + u.id })
  return safe
}

export function loginWithEmail(email, password) {
  const users = getUsers()
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase())
  if (!u || u.password !== password) return { ok: false, error: 'Invalid email or password.' }
  if (!u.verified) return { ok: false, error: 'Phone not verified yet.', needsVerify: true, phone: u.phone }
  const safe = { ...u }; delete safe.password
  setSession({ user: safe, token: 'mock-token-' + u.id })
  return { ok: true, user: safe }
}

export function requestLoginOtp(phone) {
  const u = getUsers().find(x => x.phone === phone)
  if (!u) return { ok: false, error: 'No account with this phone. Please sign up.' }
  const { code, expiresAt } = sendOtp(phone, 'login')
  return { ok: true, demoOtp: code, expiresAt }
}

export function loginWithPhoneOtp(phone, code) {
  const v = verifyOtp(phone, code)
  if (!v.ok) return v
  const u = getUsers().find(x => x.phone === phone)
  if (!u) return { ok: false, error: 'Account not found.' }
  if (!u.verified) markVerified(phone)
  const safe = { ...getUsers().find(x => x.phone === phone) }
  delete safe.password
  setSession({ user: safe, token: 'mock-token-' + safe.id })
  return { ok: true, user: safe }
}

export function requestPasswordReset(phone) {
  const u = getUsers().find(x => x.phone === phone)
  if (!u) return { ok: false, error: 'No account with this phone.' }
  const { code, expiresAt } = sendOtp(phone, 'reset')
  return { ok: true, demoOtp: code, expiresAt }
}

export function resetPassword(phone, code, newPassword) {
  const v = verifyOtp(phone, code)
  if (!v.ok) return v
  const users = getUsers()
  const u = users.find(x => x.phone === phone)
  if (!u) return { ok: false, error: 'Account not found.' }
  u.password = newPassword
  writeLS(USERS_KEY, users)
  return { ok: true }
}
