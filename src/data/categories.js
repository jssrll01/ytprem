const has = (...g) => (m) => g.some((x) => m.genres.includes(x))

export const TOP10_SLUGS = [
  'night-of-the-living-dead', 'nosferatu', 'metropolis', 'charade', 'the-general',
  'house-on-haunted-hill', 'robin-hood', 'his-girl-friday', 'safety-last', 'the-kid'
]

export const CATEGORY_DEFS = [
  { id: 'pinoy', title: 'Pinoy Movies', filter: has('Pinoy') },
  { id: 'trending', title: 'Trending Now', slugs: ['nosferatu', 'metropolis', 'night-of-the-living-dead', 'charade', 'the-general', 'robin-hood', 'house-on-haunted-hill'] },
  { id: 'popular', title: 'Popular on YT PREMIUM', slugs: ['his-girl-friday', 'safety-last', 'the-gold-rush', 'the-kid', 'the-mark-of-zorro', 'plan-9-from-outer-space', 'the-last-man-on-earth'] },
  { id: 'action', title: 'Action & Adventure', filter: has('Action', 'Adventure') },
  { id: 'comedy', title: 'Comedy', filter: has('Comedy') },
  { id: 'drama', title: 'Drama', filter: has('Drama') },
  { id: 'horror', title: 'Horror', filter: has('Horror') },
  { id: 'scifi', title: 'Sci-Fi', filter: has('Sci-Fi') },
  { id: 'docs', title: 'Documentaries', filter: has('Documentary') },
  { id: 'classics', title: 'Classics', filter: (m) => m.year <= 1940 },
  { id: 'family', title: 'Family', filter: has('Family') }
]

export function buildCategories(list) {
  return CATEGORY_DEFS.map(({ id, title, slugs, filter }) => ({
    id,
    title,
    items: slugs
      ? slugs.map((s) => list.find((m) => m.id === s)).filter(Boolean)
      : list.filter(filter)
  })).filter((c) => c.items.length > 0)
}

export function getTop10(list) {
  const picked = TOP10_SLUGS.map((s) => list.find((m) => m.id === s)).filter(Boolean)
  const rest = list.filter((m) => !picked.includes(m))
  return [...picked, ...rest].slice(0, 10)
}
