// Saved movies per user (localStorage fallback). Backend: /api/saved-movies
const keyFor = (userId) => `mr_saved_${userId || 'guest'}`

export function getSaved(userId) {
  try { return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]') } catch { return [] }
}
export function isSaved(userId, movieId) {
  return getSaved(userId).some(m => String(m.id) === String(movieId))
}
export function toggleSave(userId, movie) {
  const list = getSaved(userId)
  const exists = list.some(m => String(m.id) === String(movie.id))
  const next = exists ? list.filter(m => String(m.id) !== String(movie.id)) : [...list, movie]
  localStorage.setItem(keyFor(userId), JSON.stringify(next))
  return next
}
export function removeSaved(userId, movieId) {
  const next = getSaved(userId).filter(m => String(m.id) !== String(movieId))
  localStorage.setItem(keyFor(userId), JSON.stringify(next))
  return next
}
