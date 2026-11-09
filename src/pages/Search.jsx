import { useDeferredValue, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'
import { movies } from '../data/movies.js'
import './Search.css'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const deferred = useDeferredValue(q)

  const genres = useMemo(() => [...new Set(movies.flatMap((m) => m.genres))].sort(), [])

  const results = useMemo(() => {
    const term = deferred.trim().toLowerCase()
    if (!term) return []
    return movies.filter((m) =>
      [m.title, m.genres.join(' '), m.cast.join(' '), String(m.year)].join(' ').toLowerCase().includes(term)
    )
  }, [deferred])

  const setQuery = (value) => setParams(value ? { q: value } : {}, { replace: true })

  if (!movies.length) return <EmptyState catalog />

  return (
    <div className="search">
      <label className="search__field">
        <Icon name="search" size={20} />
        <input
          type="search"
          value={q}
          placeholder="Titles, genres, cast"
          aria-label="Search titles, genres, cast"
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </label>

      {!deferred.trim() ? (
        <section>
          <h2 className="search__heading">Browse by genre</h2>
          <div className="search__genres">
            {genres.map((g) => (
              <button key={g} type="button" className="chip" onClick={() => setQuery(g)}>{g}</button>
            ))}
          </div>
        </section>
      ) : results.length === 0 ? (
        <EmptyState title="No results" text={`Nothing matched “${deferred}”. Try a title, genre or actor.`} />
      ) : (
        <>
          <h2 className="search__heading">{results.length} result{results.length === 1 ? '' : 's'}</h2>
          <ul className="browse__grid">
            {results.map((m) => (
              <li key={m.id}><Card movie={m} /></li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
