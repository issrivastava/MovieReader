import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from '../components/MovieCard.jsx'
import { Alert, CardSkeleton, EmptyState } from '../components/ui.jsx'
import { getSavedList, toggleSaveAsync } from '../lib/saved-api.js'

export default function Saved({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    getSavedList(user?.id)
      .then(l => { if (alive) setList(l) })
      .catch(e => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [user?.id])

  const onToggle = async (movie) => {
    setList(await toggleSaveAsync(user?.id, movie))
    setNotice(`Removed “${movie.title}” from saved.`)
    setTimeout(() => setNotice(''), 2500)
  }

  return (
    <section aria-labelledby="saved-heading">
      <div className="border-b border-zinc-200 pb-6">
        <h1 id="saved-heading" className="text-2xl font-bold text-zinc-900">Saved</h1>
        <p className="mt-1 text-sm text-zinc-600" role="status">
          {loading ? 'Loading…' : `${list.length} saved title${list.length === 1 ? '' : 's'}`}
        </p>
      </div>

      <div className="mt-6">
        {notice && <div className="mb-4"><Alert tone="success">{notice}</Alert></div>}
        {error && <Alert tone="error">{error}</Alert>}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading saved movies">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : !error && list.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Save titles from Browse and they will live here, tied to your account."
            action={<Link to="/" className="inline-block rounded-md bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Browse movies</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map(m => <MovieCard key={m.id} movie={m} saved onToggleSave={onToggle} />)}
          </div>
        )}
      </div>
    </section>
  )
}
