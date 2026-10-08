// Firebase Authentication (client) — identity only. All data lives in our
// backend (Postgres). Web config comes from VITE_FIREBASE_* env vars
// (Firebase console > Project settings > Your apps > Web app).
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithCustomToken, signOut as fbSignOut,
  RecaptchaVerifier, signInWithPhoneNumber,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const FIREBASE_CONFIGURED = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let auth = null
if (FIREBASE_CONFIGURED && !getApps().length) {
  initializeApp(firebaseConfig)
}
if (FIREBASE_CONFIGURED) {
  auth = getAuth()
}

export function getFirebaseAuth() {
  if (!auth) throw new Error('Firebase login is not configured (missing VITE_FIREBASE_* env vars)')
  return auth
}

export async function firebaseSignUp(email, password) {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  return cred.user.getIdToken()
}

export async function firebaseSignIn(email, password) {
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  return cred.user.getIdToken()
}

export async function firebaseSignInWithCustomToken(customToken) {
  const cred = await signInWithCustomToken(getFirebaseAuth(), customToken)
  return cred.user
}

export async function firebaseIdToken() {
  const user = getFirebaseAuth().currentUser
  return user ? user.getIdToken() : null
}

export async function firebaseSignOut() {
  if (auth?.currentUser) await fbSignOut(auth)
}

export function friendlyAuthError(e) {
  const code = e?.code || ''
  if (code.includes('email-already-in-use')) return 'Email already registered. Try logging in.'
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Invalid email or password.'
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.'
  if (code.includes('network-request-failed')) return 'Network error. Check your connection.'
  if (code.includes('invalid-phone-number')) return 'Enter a valid phone number with country code (e.g. +91…).'
  if (code.includes('captcha-check-failed')) return 'Verification check failed. Try again.'
  if (code.includes('operation-not-allowed')) return 'Phone login is not enabled. Contact support.'
  if (code.includes('quota-exceeded')) return 'SMS quota exceeded. Try again tomorrow or contact support.'
  return e?.message || 'Authentication failed.'
}

// ---- Phone OTP via Firebase SMS (invisible reCAPTCHA) ----
// Requires: Firebase console > Authentication > Sign-in method > Phone enabled.
let phoneConfirmation = null

function recaptcha(elementId) {
  if (!window._mrRecaptcha) {
    window._mrRecaptcha = new RecaptchaVerifier(getFirebaseAuth(), elementId, { size: 'invisible' })
  }
  return window._mrRecaptcha
}

// Sends the SMS and stashes the confirmation handle. Phone must be E.164.
// elementId must exist in the DOM (a <div id="..."> on the calling screen).
export async function requestFirebasePhoneOtp(phone, elementId = 'recaptcha-container') {
  try {
    phoneConfirmation = await signInWithPhoneNumber(getFirebaseAuth(), String(phone).trim(), recaptcha(elementId))
    return true
  } catch (e) {
    phoneConfirmation = null
    throw new Error(friendlyAuthError(e))
  }
}

// Confirms the SMS code; resolves with a Firebase ID token proving the number.
export async function confirmFirebasePhoneOtp(code) {
  if (!phoneConfirmation) throw new Error('Request a code first.')
  try {
    const cred = await phoneConfirmation.confirm(String(code).trim())
    phoneConfirmation = null
    return cred.user.getIdToken()
  } catch (e) {
    throw new Error(e?.code?.includes('invalid-verification-code') ? 'Incorrect code. Try again.' : friendlyAuthError(e))
  }
}
