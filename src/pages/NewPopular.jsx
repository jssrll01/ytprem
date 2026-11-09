import { useMemo } from 'react'
import Row from '../components/Row.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { buildCategories, getTop10 } from '../data/categories.js'
import { movies } from '../data/movies.js'
import './Browse.css'

export default function NewPopular() {
  const rows = useMemo(
    () => buildCategories(movies).filter((c) => c.id === 'trending' || c.id === 'popular'),
    []
  )
  const top10 = useMemo(() => getTop10(movies), [])

  if (!movies.length) return <EmptyState catalog />

  return (
    <div className="browse">
      <header className="browse__head"><h1>New &amp; Popular</h1></header>
      <div style={{ marginTop: 'var(--space-5)', marginInline: 'calc(-1 * var(--page-pad))' }}>
        <Row title="Top 10 Today" items={top10} rank />
        {rows.map((c) => (
          <Row key={c.id} title={c.title} items={c.items} />
        ))}
      </div>
    </div>
  )
}
