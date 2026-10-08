import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { posterOf } from '../lib/tmdb.js'

// Readable + performant at scale:
// - memo: no re-render unless props change
// - lazy/async images with fixed aspect to prevent layout shift
// - content-visibility: offscreen cards skip rendering work
function MovieCard({ movie, saved, onToggleSave }) {
  const title = movie.title || movie.original_title || 'Untitled'
  const year = (movie.release_date || '').slice(0, 4)
  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : (movie.vote_average || '—')

  return (
    <article className="cv-auto overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100">
      <Link to={`/movie/${movie.id}`} tabIndex={-1} aria-hidden="true">
        <img
          src={posterOf(movie)}
          alt=""
          width="500"
          height="750"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          className="aspect-[2/3] w-full object-cover"
        />
      </Link>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-[15px] font-semibold leading-snug text-zinc-900">
          <Link to={`/movie/${movie.id}`} className="hover:text-rose-700 hover:underline underline-offset-4">
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-[13px] tabular-nums text-zinc-500">
          {year || '—'} <span aria-hidden="true" className="mx-1">·</span> <span className="text-amber-600">★</span> {rating}
        </p>
        <button
          type="button"
          onClick={() => onToggleSave(movie)}
          aria-pressed={Boolean(saved)}
          aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
          className={`mt-3 w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            saved
              ? 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700'
              : 'border-zinc-300 text-zinc-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          {saved ? '✓ Saved' : '+ Save'}
        </button>
      </div>
    </article>
  )
}

export default memo(MovieCard)
