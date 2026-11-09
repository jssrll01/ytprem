import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import useLocalStorage from '../hooks/useLocalStorage.js'
import useOpenDetails from '../hooks/useOpenDetails.js'
import { useMyList } from '../context/MyListContext.jsx'
import './HoverPreview.css'

export default function HoverPreview({ movie }) {
  const navigate = useNavigate()
  const openDetails = useOpenDetails()
  const { has, toggle } = useMyList()
  const [likes, setLikes] = useLocalStorage('yt.likes', [])
  const liked = likes.includes(movie.id)
  const inList = has(movie.id)

  const toggleLike = () =>
    setLikes((prev) => (prev.includes(movie.id) ? prev.filter((x) => x !== movie.id) : [...prev, movie.id]))

  return (
    <div className="hover-preview" role="group" aria-label={`${movie.title} actions`}>
      <div className="hover-preview__actions">
        <button type="button" className="hp-btn hp-btn--play" aria-label={`Play ${movie.title}`} onClick={() => navigate(`/watch/${movie.id}`)}>
          <Icon name="play" size={16} />
        </button>
        <button type="button" className="hp-btn" aria-label={inList ? 'Remove from My List' : 'Add to My List'} aria-pressed={inList} onClick={() => toggle(movie.id)}>
          <Icon name={inList ? 'check' : 'plus'} size={16} />
        </button>
        <button type="button" className={`hp-btn${liked ? ' is-on' : ''}`} aria-label={liked ? 'Remove like' : 'Like'} aria-pressed={liked} onClick={toggleLike}>
          <Icon name="thumb" size={16} />
        </button>
        <button type="button" className="hp-btn hp-btn--end" aria-label={`More info about ${movie.title}`} onClick={() => openDetails(movie.id)}>
          <Icon name="chevron-down" size={16} />
        </button>
      </div>
      <p className="hover-preview__meta">
        <span className="badge">{movie.rating}</span>
        <span>{movie.duration}</span>
        <span className="badge">HD</span>
      </p>
      <p className="hover-preview__genres">{movie.genres.join(' • ')}</p>
    </div>
  )
}
