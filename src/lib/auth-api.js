// Backend auth adapter — same { ok, ... } shape as auth-mock.js so pages
// need only minimal changes. Falls back to mock when no VITE_API_URL.
// Identity + phone OTP: Firebase (email/password users, SMS codes for phones).
// Data: our backend (Postgres).
import { apiFetch, USE_BACKEND, storeSession } from './api-client.js'
import {
  firebaseSignUp, firebaseSignIn,
  requestFirebasePhoneOtp, confirmFirebasePhoneOtp,
  getFirebaseAuth, friendlyAuthError,
} from './firebase-client.js'
import * as mock from './auth-mock.js'

export const useBackendAuth = USE_BACKEND

async function wrap(fn, ...args) {
  try { return await fn(...args) }
  catch (e) { return { ok: false, error: e.message, ...(e.data || {}) } }
}

export function signup({ name, email, password, phone }) {
  if (!USE_BACKEND) return mock.signup({ name, email, password, phone })
  return wrap(async () => {
    let idToken
    try {
      idToken = await firebaseSignUp(email, password)
    } catch (e) {
      if (e?.code?.includes('email-already-in-use')) {
        // Orphaned Firebase login (profile never completed) — sign in with the
        // same password and finish creating the backend profile instead.
        try {
          idToken = await firebaseSignIn(email, password)
        } catch {
          throw new Error('Email already registered. Try logging in.')
        }
      } else {
        throw new Error(friendlyAuthError(e))
      }
    }
    try {
      const r = await apiFetch('/auth/signup', { method: 'POST', body: { idToken, name, phone }, auth: false })
      return { ok: true, userId: r.userId }
    } catch (e) {
      // Avoid orphan Firebase logins when the profile step fails (e.g. phone taken).
      try { await getFirebaseAuth().currentUser?.delete() } catch { /* ignore */ }
      throw e
    }
  })
}

// Signup phone verification: caller sends the SMS first (requestVerifyOtp),
// then confirms the code (confirmVerifyOtp).
export function requestVerifyOtp(phone, elementId) {
  if (!USE_BACKEND) {
    const r = mock.sendOtp(phone, 'verify')
    return Promise.resolve({ ok: true, demoOtp: r.code, expiresAt: r.expiresAt })
  }
  return wrap(async () => {
    await requestFirebasePhoneOtp(phone, elementId)
    return { ok: true }
  })
}

export function confirmVerifyOtp(code, phone) {
  if (!USE_BACKEND) {
    const v = mock.verifyOtp(phone, code)
    if (!v.ok) return v
    return { ok: true, user: mock.markVerified(phone) }
  }
  return wrap(async () => {
    const idToken = await confirmFirebasePhoneOtp(code)
    const r = await apiFetch('/auth/verify-phone', { method: 'POST', body: { idToken }, auth: false })
    storeSession(r.user)
    return { ok: true, user: r.user }
  })
}

// Kept for compatibility; verify flow now uses request/confirmVerifyOtp.
export function verifyPhone() {
  return Promise.resolve({ ok: false, error: 'Request an SMS code first.' })
}

export function resendOtp(phone, purpose = 'verify', elementId) {
  if (purpose === 'login') return requestLoginOtp(phone, elementId)
  if (purpose === 'reset') return requestPasswordReset(phone, elementId)
  return requestVerifyOtp(phone, elementId)
}

export function loginEmail(email, password) {
  if (!USE_BACKEND) return mock.loginWithEmail(email, password)
  return wrap(async () => {
    let idToken
    try {
      idToken = await firebaseSignIn(email, password)
    } catch (e) {
      throw new Error(friendlyAuthError(e))
    }
    const r = await apiFetch('/auth/login', { method: 'POST', body: { idToken }, auth: false })
    storeSession(r.user)
    return { ok: true, user: r.user }
  })
}

export function requestLoginOtp(phone, elementId) {
  if (!USE_BACKEND) return mock.requestLoginOtp(phone)
  return wrap(async () => {
    await requestFirebasePhoneOtp(phone, elementId)
    return { ok: true }
  })
}

export function loginPhone(phone, otp) {
  if (!USE_BACKEND) return mock.loginWithPhoneOtp(phone, otp)
  return wrap(async () => {
    const idToken = await confirmFirebasePhoneOtp(otp)
    const r = await apiFetch('/auth/firebase-phone-login', { method: 'POST', body: { idToken }, auth: false })
    storeSession(r.user)
    return { ok: true, user: r.user }
  })
}

export function requestPasswordReset(phone, elementId) {
  if (!USE_BACKEND) return mock.requestPasswordReset(phone)
  return wrap(async () => {
    await requestFirebasePhoneOtp(phone, elementId)
    return { ok: true }
  })
}

export function resetPassword(phone, otp, newPassword) {
  if (!USE_BACKEND) return mock.resetPassword(phone, otp, newPassword)
  return wrap(async () => {
    const idToken = await confirmFirebasePhoneOtp(otp)
    const v = await apiFetch('/auth/verify-password-reset', { method: 'POST', body: { idToken }, auth: false })
    await apiFetch('/auth/reset-password', { method: 'POST', body: { phone, resetToken: v.resetToken, newPassword }, auth: false })
    return { ok: true }
  })
}
