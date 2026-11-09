import { useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { movies as catalog } from '../data/movies.js'
import './Browse.css'

const SORTS = [
  { id: 'default', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A–Z' }
]

export default function Browse({ title, subtitle, items, emptyTitle, emptyText }) {
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('default')

  const genres = useMemo(() => ['All', ...new Set(items.flatMap((m) => m.genres))], [items])
  const activeGenre = genres.includes(genre) ? genre : 'All'

  const visible = useMemo(() => {
    const list = activeGenre === 'All' ? [...items] : items.filter((m) => m.genres.includes(activeGenre))
    if (sort === 'newest') list.sort((a, b) => b.year - a.year)
    else if (sort === 'oldest') list.sort((a, b) => a.year - b.year)
    else if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [items, activeGenre, sort])

  if (!catalog.length) return <EmptyState catalog />

  return (
    <div className="browse">
      <header className="browse__head">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle || 'Nothing here yet'} text={emptyText || 'Check back soon.'} />
      ) : (
        <>
          <div className="browse__controls">
            <div className="chips no-scrollbar" role="group" aria-label="Filter by genre">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`chip${g === activeGenre ? ' is-active' : ''}`}
                  aria-pressed={g === activeGenre}
                  onClick={() => setGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <label className="browse__sort">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <ul className="browse__grid">
            {visible.map((m) => (
              <li key={m.id}><Card movie={m} /></li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
