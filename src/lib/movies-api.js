// Movies via backend (RapidAPI proxy, auth required) with fallback to tmdb.js mock/TMDB.
//   GET /api/movies/search?q=&page=  search (debounced 500ms in Home)
//   GET /api/movies?page=            popular / discover
import { apiFetch, USE_BACKEND, getTokenSync } from './api-client.js'
import { fetchMovies as fetchTmdb, fetchMovieDetails as detailsTmdb } from './tmdb.js'
import { FIREBASE_CONFIGURED } from './firebase-client.js'

const useBackend = () => USE_BACKEND && (FIREBASE_CONFIGURED || getTokenSync())

export async function fetchMovies({ query = '', page = 1 } = {}) {
  if (useBackend()) {
    const path = query
      ? `/movies/search?q=${encodeURIComponent(query)}&page=${page}`
      : `/movies?page=${page}`
    const d = await apiFetch(path)
    return { ...d, source: d.source || 'rapidapi' }
  }
  return fetchTmdb({ query, page })
}

export async function fetchMovieDetails(id) {
  if (useBackend()) {
    const d = await apiFetch(`/movies/${encodeURIComponent(id)}`)
    return { ...d, source: d.source || 'rapidapi' }
  }
  return detailsTmdb(id)
}
