import { Link, NavLink, useNavigate } from 'react-router-dom'

const linkCls = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-rose-700 bg-rose-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
  }`

export default function Navbar({ user, onLogout }) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-zinc-900" aria-label="MovieReader home">
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 text-sm text-white">▸</span>
            MovieReader
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            <NavLink to="/" end className={linkCls}>Browse</NavLink>
            <NavLink to="/saved" className={linkCls}>Saved</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-zinc-600 sm:inline" title={user.email || user.name}>
                {user.name}
              </span>
              <span className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-500 md:inline">
                {user.email}
              </span>
              <button
                onClick={() => { onLogout(); nav('/login') }}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                Log in
              </Link>
              <Link to="/signup" className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
