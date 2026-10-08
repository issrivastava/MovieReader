import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Signup from './pages/Signup.jsx'
import VerifyPhone from './pages/VerifyPhone.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Saved from './pages/Saved.jsx'
import Details from './pages/Details.jsx'
import { getStoredSession, clearSession, USE_BACKEND, API_BASE } from './lib/api-client.js'
import { firebaseSignOut } from './lib/firebase-client.js'
import { getSession as getMockSession, logout as mockLogout } from './lib/auth-mock.js'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const s = USE_BACKEND ? getStoredSession() : getMockSession()
    if (s?.user) setUser(s.user)
  }, [])

  const handleLogout = async () => {
    if (USE_BACKEND) { clearSession(); try { await firebaseSignOut() } catch { /* ignore */ } }
    else mockLogout()
    setUser(null)
  }

  return (
    <div className="min-h-screen text-zinc-900">
      <Navbar user={user} onLogout={handleLogout} />
      <p className="border-b border-zinc-200/70 bg-white px-4 py-2 text-center text-xs text-zinc-500">
        {USE_BACKEND
          ? <><span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />Connected to API · {API_BASE}</>
          : <>Local demo mode · set VITE_API_URL to use the backend</>}
      </p>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyPhone onVerified={setUser} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/" element={<ProtectedRoute user={user}><Home user={user} /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute user={user}><Saved user={user} /></ProtectedRoute>} />
          <Route path="/movie/:id" element={<ProtectedRoute user={user}><Details user={user} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
