import { useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Player from '../components/Player.jsx'
import './Watch.css'

const portal = (node) => createPortal(node, document.getElementById('root') || document.body)

// Plays any YouTube video chosen from search, in the same player as the catalog.
export default function WatchYT() {
  const { vid } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const valid = /^[A-Za-z0-9_-]{11}$/.test(vid || '')
  const title = (state && state.title) || 'YouTube video'

  const movie = useMemo(
    () => (valid ? { id: 'yt-' + vid, youtubeId: vid, title, genres: [], cast: [] } : null),
    [valid, vid, title]
  )

  const goBack = useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/search')
  }, [navigate])
  const toSearch = useCallback(() => navigate('/search', { replace: true }), [navigate])

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
        <h1>Video not found</h1>
        <Link to="/search" className="btn btn-play">Back to Search</Link>
      </div>
    )
  }

  return portal(
    <div className="watch">
      <Player movie={movie} next={null} onBack={goBack} onNext={toSearch} onTryAnother={toSearch} />
    </div>
  )
}
