// Saved movies: backend (Firestore, per authenticated user) with localStorage fallback.
// Spec shape: { externalMovieId, title, poster, year, rating } (+ legacy aliases).
import { apiFetch, USE_BACKEND, getTokenSync } from './api-client.js'
import { FIREBASE_CONFIGURED } from './firebase-client.js'
import { getSaved as lsGet, isSaved as lsIs, toggleSave as lsToggle } from './saved-store.js'

const useBackend = () => USE_BACKEND && (FIREBASE_CONFIGURED || getTokenSync())

export async function getSavedList(userId) {
  if (!useBackend()) return lsGet(userId)
  const d = await apiFetch('/saved-movies')
  return d.results || []
}

export async function isSavedAsync(userId, movieId) {
  if (!useBackend()) return lsIs(userId, movieId)
  const list = await getSavedList(userId)
  return list.some(m => String(m.id) === String(movieId))
}

export async function toggleSaveAsync(userId, movie) {
  if (!useBackend()) return lsToggle(userId, movie)
  const saved = await isSavedAsync(userId, movie.id)
  if (saved) {
    await apiFetch(`/saved-movies/${encodeURIComponent(movie.id)}`, { method: 'DELETE' })
  } else {
    await apiFetch('/saved-movies', {
      method: 'POST',
      body: {
        externalMovieId: movie.id,
        title: movie.title || movie.original_title,
        poster: movie.poster_path || movie.poster || '',
        year: (movie.release_date || '').slice(0, 4),
        rating: movie.vote_average || 0,
        overview: movie.overview || '',
      },
    })
  }
  return getSavedList(userId)
}
