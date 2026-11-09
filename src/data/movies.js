import { META } from './meta.js'
import ids from './ids.json'
import pinoy from './pinoy.json'

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
const backdrop = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

// Old public-domain classics (only used if no Filipino films have been saved yet)
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

// Filipino films found by scripts/resolve-pinoy.mjs (official studio channels)
const filipino = (Array.isArray(pinoy) ? pinoy : [])
  .filter((p) => p && p.id && p.youtubeId)
  .map((p) => ({
    ...p,
    genres: ['Pinoy', p.channel].filter(Boolean),
    thumbnail: thumb(p.youtubeId),
    backdrop: thumb(p.youtubeId)
  }))

// Once Filipino films exist they replace the classics everywhere
export const movies = filipino.length ? filipino : classics

export const getMovie = (id) => movies.find((m) => m.id === id)
