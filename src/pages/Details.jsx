import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui.jsx'
import { fetchMovieDetails } from '../lib/movies-api.js'
import { posterOf } from '../lib/tmdb.js'
import { isSavedAsync, toggleSaveAsync } from '../lib/saved-api.js'
import { pushRecent } from '../lib/history-store.js'

export default function Details({ user }) {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    fetchMovieDetails(id)
      .then(async (m) => {
        if (!alive) return
        setMovie(m)
        pushRecent(user?.id, m)
        setSaved(await isSavedAsync(user?.id, m.id).catch(() => false))
      })
      .catch(e => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id, user?.id])

  const onToggle = async () => {
    if (!movie || saving) return
    setSaving(true)
    await toggleSaveAsync(user?.id, {
      id: movie.id, title: movie.title || movie.original_title, overview: movie.overview,
      poster_path: movie.poster_path, vote_average: movie.vote_average, release_date: movie.release_date,
    }).catch(() => {})
    setSaved(await isSavedAsync(user?.id, movie.id).catch(() => !saved))
    setSaving(false)
  }

  if (loading) {
    return (
      <div role="status" aria-label="Loading details" className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="skeleton skeleton-pulse aspect-[2/3] w-full" />
        <div className="space-y-3">
          <div className="skeleton skeleton-pulse h-8 w-2/3" />
          <div className="skeleton skeleton-pulse h-4 w-1/3" />
          <div className="skeleton skeleton-pulse h-20 w-full" />
          <div className="skeleton skeleton-pulse h-10 w-40" />
        </div>
      </div>
    )
  }
  if (error) return <Alert tone="error">Couldn’t load this title. {error}</Alert>
  if (!movie) return null

  const title = movie.title || movie.original_title || 'Untitled'

  return (
    <article aria-labelledby="movie-title">
      <Link to="/" className="text-sm text-rose-600 underline underline-offset-4 hover:text-rose-800">Back to browse</Link>
      <div className="mt-4 grid gap-6 md:grid-cols-[280px_1fr]">
        <img
          src={posterOf(movie)}
          alt={`${title} poster`}
          width="500" height="750"
          loading="eager" decoding="async"
          className="w-full rounded-lg border border-zinc-200 object-cover"
        />
        <div>
          <h1 id="movie-title" className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm tabular-nums text-zinc-600">
            {(movie.release_date || '').slice(0, 4) || '—'} · Rating {movie.vote_average?.toFixed?.(1) ?? movie.vote_average ?? '—'}
            {movie.runtime ? ` · ${movie.runtime}` : ''}
          </p>
          {(movie.genres || []).length > 0 && (
            <ul aria-label="Genres" className="mt-3 flex flex-wrap gap-2">
              {(movie.genres || []).map(g => (
                <li key={g.name || g} className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">{g.name || g}</li>
              ))}
            </ul>
          )}
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-700">{movie.overview || 'No synopsis available.'}</p>
          <button
            type="button"
            onClick={onToggle}
            disabled={saving}
            aria-pressed={saved}
            className={`mt-6 rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              saved ? 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700' : 'border-zinc-300 bg-white text-zinc-800 hover:border-rose-300 hover:text-rose-700'
            }`}
          >
            {saving ? 'Saving…' : saved ? 'Saved — remove' : 'Save this title'}
          </button>
        </div>
      </div>
    </article>
  )
}
