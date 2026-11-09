import { META } from './meta.js'
import ids from './ids.json'

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
const backdrop = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

// Only titles with a verified YouTube ID in ids.json are playable
export const movies = META.filter((m) => ids[m.slug]).map((m) => ({
  id: m.slug,
  title: m.title,
  year: m.year,
  rating: m.rating,
  duration: m.duration,
  genres: m.genres,
  description: m.description,
  cast: m.cast,
  youtubeId: ids[m.slug],
  thumbnail: thumb(ids[m.slug]),
  backdrop: backdrop(ids[m.slug])
}))

export const getMovie = (id) => movies.find((m) => m.id === id)
