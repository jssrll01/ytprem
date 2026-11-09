import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import useOpenDetails from '../hooks/useOpenDetails.js'
import { useSettings } from '../context/SettingsContext.jsx'
import './Hero.css'

export default function Hero({ items }) {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const openDetails = useOpenDetails()
  const [index, setIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [lowRes, setLowRes] = useState({})

  const movie = items[index % items.length]
  const wide = window.matchMedia('(min-width: 768px)').matches
  const canVideo = settings.heroAutoplay && !settings.dataSaver && !settings.reduceMotion && wide
  const canRotate = items.length > 1 && !settings.reduceMotion && !canVideo

  useEffect(() => {
    if (!canRotate) return undefined
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 8000)
    return () => clearInterval(t)
  }, [canRotate, items.length])

  useEffect(() => {
    setShowVideo(false)
    setVideoReady(false)
    if (!canVideo) return undefined
    const t = setTimeout(() => setShowVideo(true), 2500)
    return () => clearTimeout(t)
  }, [movie.id, canVideo])

  const markLowRes = () => setLowRes((prev) => ({ ...prev, [movie.id]: true }))
  const onImgLoad = (e) => {
    if (e.currentTarget.naturalWidth <= 120) markLowRes()
  }

  const embed =
    `https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&mute=1&controls=0` +
    `&loop=1&playlist=${movie.youtubeId}&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&start=30`

  return (
    <section className="hero" aria-label="Featured title">
      <div className="hero__media">
        <img
          key={movie.id}
          className="hero__img"
          src={lowRes[movie.id] || settings.dataSaver ? movie.thumbnail : movie.backdrop}
          alt=""
          onLoad={onImgLoad}
          onError={markLowRes}
        />
        {showVideo && (
          <iframe
            className={`hero__video${videoReady ? ' is-ready' : ''}`}
            src={embed}
            title=""
            aria-hidden="true"
            tabIndex={-1}
            allow="autoplay; encrypted-media"
            onLoad={() => setTimeout(() => setVideoReady(true), 1200)}
          />
        )}
        <div className="hero__shade" />
        {items.length > 1 && (
          <div className="hero__dots">
            {items.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={i === index % items.length ? 'is-active' : ''}
                aria-label={`Show ${m.title}`}
                aria-current={i === index % items.length}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hero__content" key={movie.id}>
        <p className="hero__brand"><b>Y</b> FILM</p>
        <h1 className="hero__title">{movie.title}</h1>
        <p className="hero__meta">
          <span>{movie.year}</span>
          <span className="hero__badge">{movie.rating}</span>
          <span>{movie.duration}</span>
          <span className="hero__badge">HD</span>
        </p>
        <p className="hero__desc">{movie.description}</p>
        <div className="hero__buttons">
          <button type="button" className="btn btn-play" onClick={() => navigate(`/watch/${movie.id}`)}>
            <Icon name="play" size={22} /> Play
          </button>
          <button type="button" className="btn btn-info" onClick={() => openDetails(movie.id)}>
            <Icon name="info" size={22} /> More Info
          </button>
        </div>
      </div>
      <span className="hero__age" aria-hidden="true">{movie.rating}</span>
    </section>
  )
}
