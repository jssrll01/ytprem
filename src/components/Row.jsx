import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Card from './Card.jsx'
import Icon from './Icon.jsx'
import './Row.css'

function Row({ title, items, rank = false, progress }) {
  const ref = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft > 8
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 8
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, items])

  const page = (dir) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: 'smooth' })

  if (!items.length) return null

  return (
    <section className="row" aria-label={title}>
      <h2 className="row__title">{title}</h2>
      <div className="row__viewport">
        {edges.left && (
          <button type="button" className="row__arrow row__arrow--left" aria-label={`Scroll ${title} left`} onClick={() => page(-1)}>
            <Icon name="chevron-left" size={36} />
          </button>
        )}
        <ul className="row__scroller no-scrollbar" ref={ref} onScroll={update}>
          {items.map((m, i) => (
            <li key={m.id} className="row__item">
              <Card movie={m} rank={rank ? i + 1 : undefined} progress={progress?.[m.id]} />
            </li>
          ))}
        </ul>
        {edges.right && (
          <button type="button" className="row__arrow row__arrow--right" aria-label={`Scroll ${title} right`} onClick={() => page(1)}>
            <Icon name="chevron-right" size={36} />
          </button>
        )}
      </div>
    </section>
  )
}

export default memo(Row)
