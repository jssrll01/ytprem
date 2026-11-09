import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import useOpenDetails from '../hooks/useOpenDetails.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { useMyList } from '../context/MyListContext.jsx'
import { getMovie, movies } from '../data/movies.js'
import './DetailsModal.css'

export default function DetailsModal({ id, onClose }) {
  const movie = getMovie(id)
  const navigate = useNavigate()
  const openDetails = useOpenDetails()
  const { has, toggle } = useMyList()
  const [likes, setLikes] = useLocalStorage('yt.likes', [])
  const [lowRes, setLowRes] = useState(false)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!movie) onClose()
  }, [movie, onClose])

  useEffect(() => {
    setLowRes(false)
    dialogRef.current?.parentElement?.scrollTo({ top: 0 })
  }, [id])

  useEffect(() => {
    const previous = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = dialogRef.current?.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [onClose])

  const similar = useMemo(() => {
    if (!movie) return []
    return movies
      .filter((m) => m.id !== movie.id)
      .map((m) => ({
        m,
        score: m.genres.filter((g) => movie.genres.includes(g)).length * 10 - Math.abs(m.year - movie.year) / 50
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.m)
  }, [movie])

  if (!movie) return null

  const inList = has(movie.id)
  const liked = likes.includes(movie.id)
  const toggleLike = () =>
    setLikes((prev) => (prev.includes(movie.id) ? prev.filter((x) => x !== movie.id) : [...prev, movie.id]))

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
        <button type="button" className="modal__close" aria-label="Close" ref={closeRef} onClick={onClose}>
          <Icon name="close" size={22} />
        </button>

        <div className="modal__hero">
          <img
            src={lowRes ? movie.thumbnail : movie.backdrop}
            alt=""
            onLoad={(e) => e.currentTarget.naturalWidth <= 120 && setLowRes(true)}
            onError={() => setLowRes(true)}
          />
          <div className="modal__shade" />
          <div className="modal__heroContent">
            <h2 id="modal-title" className="modal__title">{movie.title}</h2>
            <div className="modal__actions">
              <button type="button" className="btn btn-play" onClick={() => navigate(`/watch/${movie.id}`)}>
                <Icon name="play" size={20} /> Play
              </button>
              <button type="button" className="modal__round" aria-label={inList ? 'Remove from My List' : 'Add to My List'} aria-pressed={inList} onClick={() => toggle(movie.id)}>
                <Icon name={inList ? 'check' : 'plus'} size={20} />
              </button>
              <button type="button" className={`modal__round${liked ? ' is-on' : ''}`} aria-label={liked ? 'Remove like' : 'Like'} aria-pressed={liked} onClick={toggleLike}>
                <Icon name="thumb" size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="modal__body">
          <div className="modal__main">
            <p className="modal__meta">
              <span>{movie.year}</span>
              <span className="modal__badge">{movie.rating}</span>
              <span>{movie.duration}</span>
              <span className="modal__badge">HD</span>
            </p>
            <p className="modal__desc">{movie.description}</p>
          </div>
          <dl className="modal__facts">
            <div><dt>Cast:</dt><dd>{movie.cast.join(', ')}</dd></div>
            <div><dt>Genres:</dt><dd>{movie.genres.join(', ')}</dd></div>
          </dl>
        </div>

        {similar.length > 0 && (
          <section className="modal__similar" aria-label="More like this">
            <h3>More Like This</h3>
            <div className="similar">
              {similar.map((m) => (
                <article key={m.id} className="similar__item">
                  <button type="button" className="similar__thumb" onClick={() => openDetails(m.id)}>
                    <img src={m.thumbnail} alt={m.title} loading="lazy" />
                    <span className="similar__dur">{m.duration}</span>
                  </button>
                  <div className="similar__info">
                    <div className="similar__head">
                      <span>{m.title} ({m.year})</span>
                      <button type="button" className="hp-btn" aria-label={has(m.id) ? `Remove ${m.title} from My List` : `Add ${m.title} to My List`} onClick={() => toggle(m.id)}>
                        <Icon name={has(m.id) ? 'check' : 'plus'} size={16} />
                      </button>
                    </div>
                    <p>{m.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
