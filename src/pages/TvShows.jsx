import { useMemo } from 'react'
import Browse from './Browse.jsx'
import { movies } from '../data/movies.js'

const toMinutes = (d) => {
  const h = /(\d+)h/.exec(d)
  const m = /(\d+)m/.exec(d)
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0)
}

export default function TvShows() {
  const items = useMemo(
    () => movies.filter((m) => m.genres.includes('Documentary') || toMinutes(m.duration) < 50),
    []
  )
  return (
    <Browse
      title="TV Shows"
      subtitle="No free series are available, so this page shows shorts and documentaries."
      items={items}
      emptyTitle="No shorts or documentaries yet"
      emptyText="Add more titles with npm run add-id."
    />
  )
}
