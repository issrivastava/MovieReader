// Recently viewed titles — device-local history per user (localStorage).
// History is device-specific (unlike saved movies, which sync to the backend).
import { posterOf } from './tmdb.js'

const keyFor = (userId) => `mr_recent_${userId || 'guest'}`
const MAX = 10

export function getRecent(userId) {
  try { return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]') } catch { return [] }
}

export function pushRecent(userId, movie) {
  if (!movie?.id) return
  const entry = {
    id: movie.id,
    title: movie.title || movie.original_title || 'Untitled',
    poster_path: movie.poster_path || movie.poster || '',
  }
  // Least-recently-viewed eviction, most recent first.
  const next = [entry, ...getRecent(userId).filter(m => String(m.id) !== String(entry.id))].slice(0, MAX)
  try { localStorage.setItem(keyFor(userId), JSON.stringify(next)) } catch { /* storage full — ignore */ }
  return next
}

export { posterOf }
