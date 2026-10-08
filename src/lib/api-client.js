// Central API client — talks to Express backend when VITE_API_URL is set,
// otherwise pages fall back to local mocks (auth-mock + mock movies).
// Sessions are Firebase ID tokens (Firebase = identity, backend = data).
import { firebaseIdToken, FIREBASE_CONFIGURED } from './firebase-client.js'

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const USE_BACKEND = Boolean(API_BASE)

const SESSION_KEY = 'mr_session'

export function getStoredSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
export function storeSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
}
export function clearSession() { localStorage.removeItem(SESSION_KEY) }

// Firebase ID token for the signed-in user (null when logged out / unconfigured).
export async function getToken() {
  if (!FIREBASE_CONFIGURED) return getStoredSession()?.token || null
  try { return await firebaseIdToken() } catch { return null }
}
export function getTokenSync() { return getStoredSession()?.token || null }

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  if (!USE_BACKEND) throw new Error('Backend not configured (VITE_API_URL missing)')
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = await getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
