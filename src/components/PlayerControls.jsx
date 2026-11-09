import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import './PlayerControls.css'

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const QUALITY_LABELS = {
  hd2160: '2160p', hd1440: '1440p', hd1080: '1080p', hd720: '720p',
  large: '480p', medium: '360p', small: '240p', tiny: '144p', auto: 'Auto'
}

const pad = (n) => String(n).padStart(2, '0')
export function fmt(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}

function SkipIcon({ dir, n }) {
  const d = dir < 0 ? 'M11 6V3L6 7l5 4V8a6 6 0 1 1-6 6' : 'M13 6V3l5 4-5 4V8a6 6 0 1 0 6 6'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
      <text x="12" y="15.5" fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">{n}</text>
    </svg>
  )
}

function SeekBar({ current, duration, buffered, onSeek }) {
  const ref = useRef(null)
  const [hover, setHover] = useState(null)
  const [scrub, setScrub] = useState(null)

  const ratioAt = (clientX) => {
    const r = ref.current.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }

  const shown = scrub ?? (duration ? current / duration : 0)
  const tip = scrub ?? hover

  return (
    <div
      ref={ref}
      className="seek"
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.floor(duration)}
      aria-valuenow={Math.floor(current)}
      aria-valuetext={`${fmt(current)} of ${fmt(duration)}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setScrub(ratioAt(e.clientX))
      }}
      onPointerMove={(e) => {
        const r = ratioAt(e.clientX)
        setHover(r)
        if (scrub !== null) setScrub(r)
      }}
      onPointerUp={(e) => {
        if (scrub === null) return
        onSeek(ratioAt(e.clientX) * duration)
        setScrub(null)
      }}
      onPointerCancel={() => setScrub(null)}
      onPointerLeave={() => setHover(null)}
    >
      <div className="seek__track">
        <div className="seek__buffer" style={{ width: `${buffered * 100}%` }} />
        <div className="seek__fill" style={{ width: `${shown * 100}%` }} />
        <div className="seek__thumb" style={{ left: `${shown * 100}%` }} />
      </div>
      {tip !== null && duration > 0 && (
        <span className="seek__tip" style={{ left: `${tip * 100}%` }}>{fmt(tip * duration)}</span>
      )}
    </div>
  )
}

export default function PlayerControls({
  visible, title, status, playing, ended, time, volume, muted, rate, quality, qualities,
  captions, fill, isFullscreen, skip, menu,
  onBack, onTogglePlay, onSeekBy, onSeek, onVolume, onToggleMute, onRate, onQuality,
  onToggleCaptions, onToggleFill, onToggleFullscreen, onMenu
}) {
  const levels = ['auto', ...qualities.filter((q) => q !== 'auto' && QUALITY_LABELS[q])]
  const silent = muted || volume === 0

  return (
    <div className={`pc${visible ? '' : ' pc--hidden'}`}>
      {menu && <div className="pc__scrim" onClick={() => onMenu(null)} />}

      <div className="pc__top">
        <button type="button" className="pc__btn" aria-label="Back" onClick={onBack}>
          <Icon name="back" size={28} />
        </button>
        <h1 className="pc__title">{title}</h1>
      </div>

      {status === 'ready' && !playing && !ended && (
        <button type="button" className="pc__center" aria-label="Play" onClick={onTogglePlay}>
          <Icon name="play" size={48} />
        </button>
      )}

      <div className="pc__bottom">
        <SeekBar current={time.current} duration={time.duration} buffered={time.buffered} onSeek={onSeek} />

        <div className="pc__row">
          <button type="button" className="pc__btn" aria-label={playing ? 'Pause' : 'Play'} onClick={onTogglePlay}>
            <Icon name={playing ? 'pause' : 'play'} size={30} />
          </button>
          <button type="button" className="pc__btn" aria-label={`Back ${skip} seconds`} onClick={() => onSeekBy(-skip)}>
            <SkipIcon dir={-1} n={skip} />
          </button>
          <button type="button" className="pc__btn" aria-label={`Forward ${skip} seconds`} onClick={() => onSeekBy(skip)}>
            <SkipIcon dir={1} n={skip} />
          </button>

          <div className="pc__volume">
            <button type="button" className="pc__btn" aria-label={silent ? 'Unmute' : 'Mute'} onClick={onToggleMute}>
              <Icon name={silent ? 'mute' : 'volume'} size={26} />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={silent ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => onVolume(Number(e.target.value))}
            />
          </div>

          <span className="pc__time">{fmt(time.current)} / {fmt(time.duration)}</span>
          <span className="pc__spacer" />

          <div className="pc__menuWrap">
            <button type="button" className="pc__btn" aria-label={`Playback speed ${rate}x`} aria-haspopup="menu" aria-expanded={menu === 'speed'} onClick={() => onMenu('speed')}>
              <Icon name="speed" size={26} />
            </button>
            {menu === 'speed' && (
              <ul className="pc__menu" role="menu" aria-label="Playback speed">
                {RATES.map((r) => (
                  <li key={r} role="none">
                    <button type="button" role="menuitemradio" aria-checked={r === rate} className={r === rate ? 'is-on' : ''} onClick={() => { onRate(r); onMenu(null) }}>
                      {r === 1 ? 'Normal' : `${r}x`}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pc__menuWrap">
            <button type="button" className="pc__btn" aria-label="Quality" aria-haspopup="menu" aria-expanded={menu === 'quality'} onClick={() => onMenu('quality')}>
              <Icon name="quality" size={26} />
            </button>
            {menu === 'quality' && (
              <ul className="pc__menu" role="menu" aria-label="Quality">
                {levels.map((q) => (
                  <li key={q} role="none">
                    <button type="button" role="menuitemradio" aria-checked={q === quality} className={q === quality ? 'is-on' : ''} onClick={() => { onQuality(q); onMenu(null) }}>
                      {QUALITY_LABELS[q]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" className={`pc__btn${captions ? ' is-on' : ''}`} aria-label="Subtitles and captions" aria-pressed={captions} onClick={onToggleCaptions}>
            <Icon name="captions" size={26} />
          </button>
          <button type="button" className={`pc__btn${fill ? ' is-on' : ''}`} aria-label={fill ? 'Fit to screen' : 'Fill screen'} aria-pressed={fill} onClick={onToggleFill}>
            <Icon name="theater" size={26} />
          </button>
          <button type="button" className="pc__btn" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={onToggleFullscreen}>
            <Icon name={isFullscreen ? 'exit-fs' : 'fullscreen'} size={26} />
          </button>
        </div>
      </div>
    </div>
  )
}
