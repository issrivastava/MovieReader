// TMDB client with graceful mock fallback.
// Set VITE_TMDB_API_KEY in .env to use real data. Otherwise mock catalog is used
// so the UI (search, pagination, details, save) works immediately.

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/w500'

export const hasRealApi = Boolean(API_KEY)
export const imgUrl = (path) => (path ? (path.startsWith('http') ? path : `${IMG}${path}`) : '')

// ---- Mock catalog (12 titles, paginated 8 per page to demo pagination) ----
const MOCK = [
  { id: 1, title: 'Inception', overview: 'A thief who steals secrets from dreams takes one last job.', poster_path: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', vote_average: 8.4, release_date: '2010-07-16', genre: 'Sci-Fi' },
  { id: 2, title: 'Interstellar', overview: 'Explorers travel through a wormhole in search of a new home.', poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', vote_average: 8.7, release_date: '2014-11-07', genre: 'Sci-Fi' },
  { id: 3, title: 'The Dark Knight', overview: 'Batman faces the Joker in Gotham.', poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', vote_average: 9.0, release_date: '2008-07-18', genre: 'Action' },
  { id: 4, title: 'Dune: Part Two', overview: 'Paul Atreides unites with the Fremen for war.', poster_path: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', vote_average: 8.3, release_date: '2024-03-01', genre: 'Sci-Fi' },
  { id: 5, title: 'Oppenheimer', overview: 'The story of J. Robert Oppenheimer and the atomic bomb.', poster_path: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', vote_average: 8.1, release_date: '2023-07-21', genre: 'Drama' },
  { id: 6, title: 'Spider-Man: No Way Home', overview: 'Peter Parker seeks help from Doctor Strange.', poster_path: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', vote_average: 8.0, release_date: '2021-12-17', genre: 'Action' },
  { id: 7, title: 'The Shawshank Redemption', overview: 'Hope and friendship behind bars.', poster_path: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', vote_average: 9.3, release_date: '1994-09-23', genre: 'Drama' },
  { id: 8, title: 'Parasite', overview: 'A poor family schemes into a wealthy household.', poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', vote_average: 8.5, release_date: '2019-05-30', genre: 'Thriller' },
  { id: 9, title: 'Avengers: Endgame', overview: 'The Avengers assemble for one final stand.', poster_path: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', vote_average: 8.2, release_date: '2019-04-26', genre: 'Action' },
  { id: 10, title: 'Joker', overview: 'A failed comedian descends into madness.', poster_path: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', vote_average: 8.1, release_date: '2019-10-04', genre: 'Crime' },
  { id: 11, title: 'Coco', overview: 'A boy journeys through the Land of the Dead.', poster_path: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg', vote_average: 8.2, release_date: '2017-11-22', genre: 'Animation' },
  { id: 12, title: 'The Godfather', overview: 'The aging patriarch of a crime dynasty.', poster_path: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', vote_average: 9.2, release_date: '1972-03-24', genre: 'Crime' },
  { id: 13, title: 'Forrest Gump', overview: 'A kind man witnesses decades of American history.', poster_path: 'https://image.tmdb.org/t/p/w500/ar9EGvpRqHeyflCj5VDtZD6t90x.jpg', vote_average: 8.8, release_date: '1994-07-06', genre: 'Drama' },
  { id: 14, title: 'The Matrix', overview: 'A hacker learns reality is a simulation.', poster_path: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', vote_average: 8.7, release_date: '1999-03-31', genre: 'Sci-Fi' },
  { id: 15, title: 'Gladiator', overview: 'A betrayed general fights for revenge in the arena.', poster_path: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', vote_average: 8.5, release_date: '2000-05-05', genre: 'Action' },
  { id: 16, title: 'Titanic', overview: 'A love story aboard the ill-fated ship.', poster_path: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPCswI74vB.jpg', vote_average: 7.9, release_date: '1997-12-19', genre: 'Romance' },
  { id: 17, title: 'The Lion King', overview: 'A cub prince reclaims his kingdom.', poster_path: 'https://image.tmdb.org/t/p/w500/sKCr78PssJxVAVAwdYxNAFHAvZh.jpg', vote_average: 8.5, release_date: '1994-06-24', genre: 'Animation' },
  { id: 18, title: 'Whiplash', overview: 'A drummer and a ruthless instructor push limits.', poster_path: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', vote_average: 8.5, release_date: '2014-10-10', genre: 'Drama' },
  { id: 19, title: 'La La Land', overview: 'An actress and a jazzman chase dreams in LA.', poster_path: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', vote_average: 8.0, release_date: '2016-12-09', genre: 'Romance' },
  { id: 20, title: 'Mad Max: Fury Road', overview: 'A high-octane chase across the wasteland.', poster_path: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg', vote_average: 8.1, release_date: '2015-05-15', genre: 'Action' },
  { id: 21, title: 'The Silence of the Lambs', overview: 'An agent consults a caged killer to catch another.', poster_path: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', vote_average: 8.6, release_date: '1991-02-14', genre: 'Thriller' },
  { id: 22, title: 'Saving Private Ryan', overview: 'Soldiers cross war-torn France to bring one home.', poster_path: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrp3G.jpg', vote_average: 8.6, release_date: '1998-07-24', genre: 'War' },
  { id: 23, title: "Schindler's List", overview: 'A businessman saves lives during the Holocaust.', poster_path: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', vote_average: 9.0, release_date: '1993-12-15', genre: 'Drama' },
  { id: 24, title: 'Guardians of the Galaxy', overview: 'Misfits band together to save the galaxy.', poster_path: 'https://image.tmdb.org/t/p/w500/r7vmZjiyZw9F9JMQJ45Qwto5eJ.jpg', vote_average: 8.0, release_date: '2014-08-01', genre: 'Action' },
  { id: 25, title: 'Top Gun: Maverick', overview: 'Maverick trains a new generation of pilots.', poster_path: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', vote_average: 8.2, release_date: '2022-05-27', genre: 'Action' },
]

function mockSearch(query, page, perPage = 8) {
  const q = query.trim().toLowerCase()
  const filtered = q ? MOCK.filter(m => m.title.toLowerCase().includes(q)) : [...MOCK]
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * perPage
  return {
    results: filtered.slice(start, start + perPage),
    page: safePage,
    total_pages: totalPages,
    total_results: filtered.length,
    source: 'mock'
  }
}

export async function fetchMovies({ query = '', page = 1 } = {}) {
  if (!hasRealApi) {
    await new Promise(r => setTimeout(r, 300)) // simulate latency
    return mockSearch(query, page)
  }
  const url = query
    ? `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    : `${BASE}/movie/popular?api_key=${API_KEY}&page=${page}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch movies')
  const data = await res.json()
  return { ...data, source: 'tmdb' }
}

export async function fetchMovieDetails(id) {
  const mock = MOCK.find(m => String(m.id) === String(id))
  if (!hasRealApi) {
    await new Promise(r => setTimeout(r, 250))
    if (!mock) throw new Error('Movie not found')
    return { ...mock, source: 'mock', runtime: 148, genres: [{ name: mock.genre }] }
  }
  if (mock && !API_KEY) return mock
  const res = await fetch(`${BASE}/movie/${id}?api_key=${API_KEY}`)
  if (!res.ok) throw new Error('Failed to fetch details')
  const data = await res.json()
  return { ...data, source: 'tmdb' }
}

export function posterOf(m) {
  if (!m) return ''
  const p = m.poster_path || m.poster
  if (!p) return ''
  return p.startsWith('http') ? p : `${IMG}${p}`
}
