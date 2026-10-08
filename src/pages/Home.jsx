import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard.jsx'
import { Alert, CardSkeleton, EmptyState, Field, TextInput } from '../components/ui.jsx'
import { fetchMovies } from '../lib/movies-api.js'
import { useDebounce } from '../lib/useDebounce.js'
import { getSavedList, toggleSaveAsync } from '../lib/saved-api.js'
import { getRecent, posterOf } from '../lib/history-store.js'

export default function Home({ user }) {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 500)
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ results: [], total_pages: 1, total_results: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [recent, setRecent] = useState(() => getRecent(user?.id))

  // Pagination preserves search: only reset page when the debounced query changes.
  useEffect(() => { setPage(1) }, [debounced])

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    fetchMovies({ query: debounced, page })
      .then(d => { if (alive) setData(d) })
      .catch(e => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [debounced, page])

  useEffect(() => {
    let alive = true
    getSavedList(user?.id).then(list => {
      if (alive) setSavedIds(new Set(list.map(m => String(m.id))))
    }).catch(() => {})
    return () => { alive = false }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const onToggle = async (movie) => {
    const next = await toggleSaveAsync(user?.id, {
      id: movie.id, title: movie.title, overview: movie.overview,
      poster_path: movie.poster_path, vote_average: movie.vote_average, release_date: movie.release_date
    })
    setSavedIds(new Set(next.map(m => String(m.id))))
  }

  const surprise = () => {
    if (!data.results.length) return
    const pick = data.results[Math.floor(Math.random() * data.results.length)]
    nav(`/movie/${pick.id}`)
  }

  const retry = () => {
    setError('')
    setLoading(true)
    fetchMovies({ query: debounced, page })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  return (
    <section aria-labelledby="browse-heading">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 id="browse-heading" className="text-2xl font-bold text-zinc-900">Browse movies</h1>
          <p className="mt-1 text-sm text-zinc-600" role="status">
            {loading ? 'Loading…' : `${data.total_results} result${data.total_results === 1 ? '' : 's'}${debounced ? ` for “${debounced}”` : ''}`}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Field label="Search" htmlFor="movie-search" hint="Search updates automatically as you type.">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TextInput
                  id="movie-search"
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Title, e.g. Dune"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-zinc-500 hover:text-rose-700"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={surprise}
                disabled={loading || !data.results.length}
                title="Open a random title from these results"
                aria-label="Surprise me — open a random title"
                className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-lg leading-none text-rose-700 hover:bg-rose-100 disabled:opacity-40"
              >
                🎲
              </button>
            </div>
          </Field>
        </div>
      </div>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-6">
          <h2 id="recent-heading" className="text-sm font-semibold text-zinc-800">Recently viewed</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {recent.map(m => (
              <Link key={m.id} to={`/movie/${m.id}`} className="group w-20 shrink-0">
                <img
                  src={posterOf(m)} alt="" width="160" height="240" loading="lazy" decoding="async"
                  className="aspect-[2/3] w-20 rounded-md border border-zinc-200 object-cover group-hover:border-rose-300"
                />
                <p className="mt-1 line-clamp-2 text-xs leading-tight text-zinc-600 group-hover:text-zinc-900">{m.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {error && (
        <div className="mt-6">
          <Alert tone="error">
            <span className="font-semibold">Couldn’t load movies. </span>{error}{' '}
            <button type="button" onClick={retry} className="ml-1 font-semibold underline underline-offset-4">Retry</button>
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading movies" role="status">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !error && data.results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={debounced ? `No results for “${debounced}”` : 'No movies yet'}
            body={debounced ? 'Check spelling or try a different title. Clearing the search shows everything.' : 'Movies will appear here once the catalogue loads.'}
            action={debounced ? <button type="button" onClick={() => setQuery('')} className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">Clear search</button> : null}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.results.map(m => (
            <MovieCard key={m.id} movie={m} saved={savedIds.has(String(m.id))} onToggleSave={onToggle} />
          ))}
        </div>
      )}

      <nav aria-label="Pagination" className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-5">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:border-rose-300 hover:text-rose-700 disabled:opacity-40"
        >
          Previous
        </button>
        <p className="text-sm tabular-nums text-zinc-600" aria-live="polite">
          Page {data.page || page} of {data.total_pages}
        </p>
        <button
          type="button"
          disabled={page >= data.total_pages || loading}
          onClick={() => setPage(p => p + 1)}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:border-rose-300 hover:text-rose-700 disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </section>
  )
}
