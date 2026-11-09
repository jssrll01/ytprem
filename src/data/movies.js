import { META } from './meta.js'
import ids from './ids.json'
import pinoy from './pinoy.json'

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
const backdrop = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

// Only titles with a verified YouTube ID in ids.json are playable
const classics = META.filter((m) => ids[m.slug]).map((m) => ({
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

// Filipino films found by scripts/resolve-pinoy.mjs (official channels only)
const filipino = (Array.isArray(pinoy) ? pinoy : [])
  .filter((p) => p && p.id && p.youtubeId)
  .map((p) => ({ ...p, thumbnail: thumb(p.youtubeId), backdrop: thumb(p.youtubeId) }))

export const movies = [...classics, ...filipino]

export const getMovie = (id) => movies.find((m) => m.id === id)
