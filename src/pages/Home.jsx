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

  const categories = useMemo(() => {
    const all = buildCategories(movies)
    const pin = all.find((c) => c.id === 'pinoy')
    return pin ? [pin, ...all.filter((c) => c.id !== 'pinoy')] : all
  }, [])
  const pinoyItems = useMemo(() => movies.filter((m) => m.genres && m.genres.includes('Pinoy')), [])
  const pinoyFirst = pinoyItems.length >= 5
  const top10 = useMemo(() => (pinoyFirst ? pinoyItems.slice(0, 10) : getTop10(movies)), [pinoyFirst, pinoyItems])
  const featured = useMemo(() => {
    if (pinoyFirst) return pinoyItems.slice(0, 5)
    const trending = categories.find((c) => c.id === 'trending')
    return (trending?.items.length ? trending.items : movies).slice(0, 5)
  }, [categories, pinoyFirst, pinoyItems])

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
        {settings.showTop10 && <Row title={pinoyFirst ? 'Top 10 Pinoy Movies Today' : 'Top 10 on YT PREMIUM Today'} items={top10} rank />}
        {categories.map((c) => (
          <Row key={c.id} title={c.title} items={c.items} />
        ))}
      </div>
    </>
  )
}
