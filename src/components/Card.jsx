import { memo, useState } from 'react'
import HoverPreview from './HoverPreview.jsx'
import useOpenDetails from '../hooks/useOpenDetails.js'
import { useSettings } from '../context/SettingsContext.jsx'
import './Card.css'

function Card({ movie, rank, progress }) {
  const { settings } = useSettings()
  const openDetails = useOpenDetails()
  const [armed, setArmed] = useState(false)
  const hoverable = settings.hoverPreviews
  const src = settings.dataSaver ? movie.thumbnail.replace('hqdefault', 'mqdefault') : movie.thumbnail

  return (
    <article
      className={`card${rank ? ' card--rank' : ''}${hoverable ? ' card--hoverable' : ''}`}
      onMouseEnter={() => hoverable && setArmed(true)}
    >
      {rank && <span className="card__rank" aria-hidden="true">{rank}</span>}
      <div className="card__body">
        <button type="button" className="card__media" onClick={() => openDetails(movie.id)}>
          <img src={src} alt={movie.title} loading="lazy" decoding="async" />
          <span className="card__title" aria-hidden="true">{movie.title}</span>
          {progress > 0 && (
            <span className="card__progress" role="progressbar" aria-label="Watched" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
          )}
        </button>
        {armed && <HoverPreview movie={movie} />}
      </div>
    </article>
  )
}

export default memo(Card)
