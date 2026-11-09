import { useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Player from '../components/Player.jsx'
import { buildCategories } from '../data/categories.js'
import { getMovie, movies } from '../data/movies.js'
import './Watch.css'

// Rendered into #root, outside the animated page wrapper, so position:fixed always means "the screen".
const portal = (node) => createPortal(node, document.getElementById('root') || document.body)

export default function Watch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movie = getMovie(id)

  // Next title in the same category
  const next = useMemo(() => {
    if (!movie) return null
    const cats = buildCategories(movies)
    const cat =
      cats.find((c) => c.id !== 'trending' && c.id !== 'popular' && c.items.some((m) => m.id === movie.id)) ||
      cats[0]
    const pool = cat && cat.items.length > 1 ? cat.items : movies
    const i = pool.findIndex((m) => m.id === movie.id)
    const candidate = pool[(i + 1) % pool.length]
    return candidate && candidate.id !== movie.id ? candidate : null
  }, [movie])

  const goBack = useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }, [navigate])

  const goNext = useCallback(() => {
    if (next) navigate(`/watch/${next.id}`, { replace: true })
  }, [next, navigate])

  const tryAnother = useCallback(() => {
    const others = movies.filter((m) => m.id !== id)
    if (!others.length) navigate('/')
    else navigate(`/watch/${others[Math.floor(Math.random() * others.length)].id}`, { replace: true })
  }, [id, navigate])

  useEffect(() => {
    const previous = document.title
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (movie) document.title = `${movie.title} - YT PREMIUM`
    return () => {
      document.title = previous
      document.body.style.overflow = overflow
    }
  }, [movie])

  if (!movie) {
    return portal(
      <div className="watch watch--missing">
        <h1>Title not found</h1>
        <Link to="/" className="btn btn-play">Back to Home</Link>
      </div>
    )
  }

  return portal(
    <div className="watch">
      <Player movie={movie} next={next} onBack={goBack} onNext={goNext} onTryAnother={tryAnother} />
    </div>
  )
}
