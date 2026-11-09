import { useCallback, useEffect, useRef, useState } from 'react'
import PlayerControls from './PlayerControls.jsx'
import Icon from './Icon.jsx'
import useFullscreenLandscape from '../hooks/useFullscreenLandscape.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { useMyList } from '../context/MyListContext.jsx'
import './Player.css'

const ENDED = 0
const PLAYING = 1
const BUFFERING = 3
const CAPTION_SIZE = { small: -1, medium: 0, large: 2 }
const ERROR_TEXT = {
  2: 'This video link is invalid.',
  5: 'This video can’t be played in this player.',
  100: 'This video was removed or is private.',
  101: 'The owner doesn’t allow this video to be embedded.',
  150: 'The owner doesn’t allow this video to be embedded.'
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

let apiPromise = null
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => {
        apiPromise = null
        reject(new Error('YouTube API failed to load'))
      }
      document.head.appendChild(script)
    })
  }
  return apiPromise
}

// Captions are not part of the documented API, so this is best effort
function applyCaptions(player, on, size) {
  try {
    if (on) {
      player.loadModule?.('captions')
      player.setOption?.('captions', 'fontSize', CAPTION_SIZE[size] ?? 0)
    } else {
      player.unloadModule?.('captions')
    }
  } catch {
    /* module unavailable for this video */
  }
}

export default function Player({ movie, next, onBack, onNext, onTryAnother }) {
  const { settings } = useSettings()
  const { progress, saveProgress } = useMyList()

  const settingsRef = useRef(settings)
  const progressRef = useRef(progress)
  const saveRef = useRef(saveProgress)
  settingsRef.current = settings
  progressRef.current = progress
  saveRef.current = saveProgress

  const containerRef = useRef(null)
  const mountRef = useRef(null)
  const playerRef = useRef(null)
  const lastSaved = useRef(0)
  const capsApplied = useRef(false)
  const pendingFs = useRef(false)
  const fs = useFullscreenLandscape(containerRef)
  const { enter: enterFullscreen } = fs

  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [playerState, setPlayerState] = useState(-1)
  const [time, setTime] = useState({ current: 0, duration: 0, buffered: 0 })
  const [volume, setVolume] = useState(settings.volume)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(settings.speed)
  const [quality, setQuality] = useState('auto')
  const [qualities, setQualities] = useState([])
  const [captions, setCaptions] = useState(settings.captions)
  const [fill, setFill] = useState(false)
  const [menu, setMenu] = useState(null)
  const [visible, setVisible] = useState(true)
  const [pokeTick, setPokeTick] = useState(0)
  const [countdown, setCountdown] = useState(null)

  const playing = playerState === PLAYING || playerState === BUFFERING
  const ended = playerState === ENDED
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  const poke = useCallback(() => {
    setVisible(true)
    setPokeTick((t) => t + 1)
  }, [])

  // Create the YouTube player for this title
  useEffect(() => {
    let cancelled = false
    const s = settingsRef.current
    const saved = progressRef.current[movie.id]
    const start = s.resume && saved && saved.t > 5 && saved.t / saved.d < 0.95 ? saved.t : 0

    capsApplied.current = false
    setStatus('loading')
    setPlayerState(-1)
    setCountdown(null)
    setTime({ current: 0, duration: 0, buffered: 0 })
    setVolume(s.volume)
    setMuted(false)
    setRate(s.speed)
    setQuality('auto')
    setCaptions(s.captions)

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return
        const holder = document.createElement('div')
        mountRef.current.appendChild(holder)
        playerRef.current = new YT.Player(holder, {
          host: 'https://www.youtube-nocookie.com',
          videoId: movie.youtubeId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            cc_load_policy: s.captions ? 1 : 0,
            autoplay: 1,
            start,
            origin: window.location.origin
          },
          events: {
            onReady: (e) => {
              const p = e.target
              try {
                p.setVolume(s.volume)
                p.setPlaybackRate(s.speed)
                if (s.dataSaver) p.setPlaybackQuality('medium')
                else if (s.quality !== 'auto') p.setPlaybackQuality(s.quality)
              } catch {
                /* some options may be rejected */
              }
              setStatus('ready')
              p.playVideo()
              if (s.fullscreenOnPlay || s.landscapeOnPlay) {
                if (navigator.userActivation?.isActive) {
                  enterFullscreen({ landscape: s.landscapeOnPlay })
                } else {
                  pendingFs.current = true
                }
              }
            },
            onStateChange: (e) => {
              setPlayerState(e.data)
              if (e.data === PLAYING) {
                const p = e.target
                try {
                  setQualities(p.getAvailableQualityLevels?.() || [])
                  setQuality(p.getPlaybackQuality?.() || 'auto')
                } catch {
                  /* ignore */
                }
                if (!capsApplied.current) {
                  capsApplied.current = true
                  applyCaptions(p, settingsRef.current.captions, settingsRef.current.captionSize)
                }
              }
            },
            onPlaybackRateChange: (e) => setRate(e.data),
            onPlaybackQualityChange: (e) => setQuality(e.data),
            onError: (e) => {
              setErrorMsg(ERROR_TEXT[e.data] || 'This video is unavailable.')
              setStatus('error')
            }
          }
        })
      })
      .catch(() => {
        if (cancelled) return
        setErrorMsg('The player could not load. Check your connection.')
        setStatus('error')
      })

    return () => {
      cancelled = true
      const p = playerRef.current
      try {
        if (p && settingsRef.current.resume) {
          const d = p.getDuration()
          const t = p.getCurrentTime()
          if (d > 0 && t > 1) saveRef.current(movie.id, t, d)
        }
        p?.destroy()
      } catch {
        /* player already gone */
      }
      playerRef.current = null
      if (mountRef.current) mountRef.current.innerHTML = ''
    }
  }, [movie.id, movie.youtubeId, enterFullscreen])

  // Time, buffer and progress saving
  useEffect(() => {
    if (status !== 'ready') return undefined
    const id = setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      const current = p.getCurrentTime()
      const duration = p.getDuration() || 0
      setTime({ current, duration, buffered: p.getVideoLoadedFraction?.() || 0 })
      const now = Date.now()
      if (settingsRef.current.resume && duration > 0 && current > 1 && now - lastSaved.current > 5000) {
        lastSaved.current = now
        saveRef.current(movie.id, current, duration)
      }
    }, 250)
    return () => clearInterval(id)
  }, [status, movie.id])

  // Save when the page is hidden or closed
  useEffect(() => {
    const save = () => {
      const p = playerRef.current
      if (!p?.getCurrentTime || !settingsRef.current.resume) return
      const d = p.getDuration()
      const t = p.getCurrentTime()
      if (d > 0 && t > 1) saveRef.current(movie.id, t, d)
    }
    const onVis = () => document.visibilityState === 'hidden' && save()
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [movie.id])

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (!visible || !playing || menu) return undefined
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [visible, playing, menu, pokeTick])

  // Fill mode: scale the video to cover the screen
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      const ca = width / height
      const va = 16 / 9
      el.style.setProperty('--fill-scale', Math.max(ca / va, va / ca).toFixed(4))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // End of video: up-next countdown
  useEffect(() => {
    if (!ended) {
      setCountdown(null)
      return
    }
    const p = playerRef.current
    const d = p?.getDuration?.() || 0
    if (d > 0) saveRef.current(movie.id, d, d)
    if (settingsRef.current.autoplayNext && next) setCountdown(8)
  }, [ended, movie.id, next])

  useEffect(() => {
    if (countdown === null) return undefined
    if (countdown <= 0) {
      onNext?.()
      return undefined
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? c : c - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown, onNext])

  // Controls
  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p?.getPlayerState) return
    if (p.getPlayerState() === PLAYING) p.pauseVideo()
    else p.playVideo()
  }, [])

  const seekTo = useCallback((t) => {
    const p = playerRef.current
    if (!p?.seekTo) return
    const d = p.getDuration() || 0
    const target = clamp(t, 0, d)
    p.seekTo(target, true)
    setTime((prev) => ({ ...prev, current: target }))
  }, [])

  const seekBy = useCallback(
    (delta) => {
      const p = playerRef.current
      if (p?.getCurrentTime) seekTo(p.getCurrentTime() + delta)
    },
    [seekTo]
  )

  const changeVolume = useCallback((v) => {
    const p = playerRef.current
    if (!p) return
    p.setVolume(v)
    setVolume(v)
    if (v > 0 && p.isMuted()) {
      p.unMute()
      setMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.isMuted() || volumeRef.current === 0) {
      p.unMute()
      setMuted(false)
      if (volumeRef.current === 0) {
        p.setVolume(50)
        setVolume(50)
      }
    } else {
      p.mute()
      setMuted(true)
    }
  }, [])

  const changeRate = useCallback((r) => {
    playerRef.current?.setPlaybackRate(r)
    setRate(r)
  }, [])

  const changeQuality = useCallback((q) => {
    playerRef.current?.setPlaybackQuality(q)
    setQuality(q)
  }, [])

  const toggleCaptions = useCallback(() => {
    const p = playerRef.current
    setCaptions((on) => {
      if (p) applyCaptions(p, !on, settingsRef.current.captionSize)
      return !on
    })
  }, [])

  const toggleMenu = useCallback((name) => {
    if (name === 'quality') {
      try {
        setQualities(playerRef.current?.getAvailableQualityLevels?.() || [])
      } catch {
        /* ignore */
      }
    }
    setMenu((m) => (name === null || m === name ? null : name))
  }, [])

  const replay = () => {
    seekTo(0)
    playerRef.current?.playVideo()
  }

  // First tap grants permission for the fullscreen-on-play settings
  useEffect(() => {
    const onUp = () => {
      if (!pendingFs.current) return
      pendingFs.current = false
      enterFullscreen({ landscape: settingsRef.current.landscapeOnPlay })
    }
    window.addEventListener('pointerup', onUp)
    return () => window.removeEventListener('pointerup', onUp)
  }, [enterFullscreen])

  // Keyboard shortcuts
  const keyHandler = useRef(null)
  keyHandler.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
    const skip = settingsRef.current.skipSeconds
    switch (e.key) {
      case ' ':
        if (tag === 'BUTTON') return
        e.preventDefault()
        togglePlay()
        break
      case 'k': case 'K':
        togglePlay()
        break
      case 'j': case 'J':
        seekBy(-skip)
        break
      case 'l': case 'L':
        seekBy(skip)
        break
      case 'ArrowLeft':
        e.preventDefault()
        seekBy(-5)
        break
      case 'ArrowRight':
        e.preventDefault()
        seekBy(5)
        break
      case 'ArrowUp':
        e.preventDefault()
        changeVolume(clamp(volumeRef.current + 5, 0, 100))
        break
      case 'ArrowDown':
        e.preventDefault()
        changeVolume(clamp(volumeRef.current - 5, 0, 100))
        break
      case 'f': case 'F':
        fs.toggle({ landscape: true })
        break
      case 'm': case 'M':
        toggleMute()
        break
      case 'c': case 'C':
        toggleCaptions()
        break
      case 'Escape':
        if (menu) setMenu(null)
        else if (fs.isFullscreen) fs.exit()
        else onBack?.()
        break
      default:
        return
    }
    poke()
  }

  useEffect(() => {
    const handler = (e) => keyHandler.current(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const onSurface = (e) => {
    if (e.pointerType === 'mouse') {
      togglePlay()
      poke()
    } else if (visible) {
      setVisible(false)
    } else {
      poke()
    }
  }

  const showControls = visible || !playing || Boolean(menu)
  const cls = `player${fill ? ' player--fill' : ''}${playing && !showControls ? ' player--idle' : ''}`

  return (
    <div className={cls} ref={containerRef} onMouseMove={poke}>
      <div className="player__video" ref={mountRef} />

      {(status === 'loading' || playerState === BUFFERING) && status !== 'error' && (
        <div className="player__spinner" role="status" aria-label="Loading" />
      )}

      {status !== 'error' && (
        <div className="player__surface" onPointerUp={onSurface} onDoubleClick={() => fs.toggle({ landscape: true })} />
      )}

      <PlayerControls
        visible={showControls}
        title={movie.title}
        status={status}
        playing={playing}
        ended={ended}
        time={time}
        volume={volume}
        muted={muted}
        rate={rate}
        quality={quality}
        qualities={qualities}
        captions={captions}
        fill={fill}
        isFullscreen={fs.isFullscreen}
        skip={settings.skipSeconds}
        menu={menu}
        onBack={onBack}
        onTogglePlay={togglePlay}
        onSeekBy={seekBy}
        onSeek={seekTo}
        onVolume={changeVolume}
        onToggleMute={toggleMute}
        onRate={changeRate}
        onQuality={changeQuality}
        onToggleCaptions={toggleCaptions}
        onToggleFill={() => setFill((v) => !v)}
        onToggleFullscreen={() => fs.toggle({ landscape: true })}
        onMenu={toggleMenu}
      />

      {fs.showRotateHint && (
        <div className="player__rotate" role="status">
          <Icon name="rotate" size={40} />
          <span>Rotate your device for the best view</span>
        </div>
      )}

      {status === 'error' && (
        <div className="player__panel" role="alert">
          <h2>Video unavailable</h2>
          <p>{errorMsg}</p>
          <div className="player__panelBtns">
            <button type="button" className="btn btn-play" onClick={onTryAnother}>Try another title</button>
            <button type="button" className="btn btn-info" onClick={onBack}>Go back</button>
          </div>
        </div>
      )}

      {ended && status !== 'error' && (
        <div className="player__panel">
          {countdown !== null && next ? (
            <>
              <p className="player__upnext">Up next in {countdown}</p>
              <h2>{next.title}</h2>
              <div className="player__panelBtns">
                <button type="button" className="btn btn-play" onClick={onNext}>
                  <Icon name="play" size={20} /> Play now
                </button>
                <button type="button" className="btn btn-info" onClick={() => setCountdown(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h2>{movie.title}</h2>
              <div className="player__panelBtns">
                <button type="button" className="btn btn-play" onClick={replay}>Watch again</button>
                {next && (
                  <button type="button" className="btn btn-info" onClick={onNext}>Next: {next.title}</button>
                )}
                <button type="button" className="btn btn-info" onClick={onBack}>Back</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
