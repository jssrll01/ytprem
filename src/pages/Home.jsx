import { useMemo } from 'react'
import Hero from '../components/Hero.jsx'
import Row from '../components/Row.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { buildCategories, getTop10 } from '../data/categories.js'
import { getMovie, movies } from '../data/movies.js'
import { useMyList } from '../context/MyListContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import './Home.css'

export default function Home() {
  const { settings } = useSettings()
  const { continueWatching } = useMyList()

  // One row per studio channel; falls back to genre rows when titles have no channel
  const rows = useMemo(() => {
    const groups = new Map()
    movies.forEach((m) => {
      if (!m.channel) return
      if (!groups.has(m.channel)) groups.set(m.channel, [])
      groups.get(m.channel).push(m)
    })
    if (groups.size) return [...groups].map(([name, items]) => ({ id: name, title: name, items }))
    return buildCategories(movies)
  }, [])
  const top10 = useMemo(() => getTop10(movies), [])
  const featured = useMemo(() => {
    const trending = rows.find((c) => c.id === 'trending')
    return (trending && trending.items.length ? trending.items : movies).slice(0, 5)
  }, [rows])

  const resume = useMemo(
    () =>
      continueWatching
        .map((c) => ({ movie: getMovie(c.id), ratio: c.t / c.d }))
        .filter((x) => x.movie),
    [continueWatching]
  )
  const resumeItems = useMemo(() => resume.map((r) => r.movie), [resume])
  const progressMap = useMemo(() => Object.fromEntries(resume.map((r) => [r.movie.id, r.ratio])), [resume])

  if (!movies.length) return <EmptyState catalog />

  return (
    <>
      <Hero items={featured} />
      <div className="home__rows">
        <Row title="Continue Watching" items={resumeItems} progress={progressMap} />
        {settings.showTop10 && <Row title="Top 10 on YT PREMIUM Today" items={top10} rank />}
        {rows.map((c) => (
          <Row key={c.id} title={c.title} items={c.items} />
        ))}
      </div>
    </>
  )
}
