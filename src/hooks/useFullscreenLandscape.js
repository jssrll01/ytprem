import { useCallback, useEffect, useState } from 'react'

const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null
const CSS_FS = 'is-css-fullscreen'

const unlockOrientation = () => {
  try {
    window.screen.orientation?.unlock?.()
  } catch {
    /* not supported */
  }
}

export default function useFullscreenLandscape(ref) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const onOrientation = () => setIsPortrait(mq.matches)
    const onFsChange = () => {
      const active = Boolean(fsElement())
      setIsFullscreen(active)
      if (!active) unlockOrientation()
    }
    mq.addEventListener('change', onOrientation)
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      mq.removeEventListener('change', onOrientation)
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
    }
  }, [])

  const enter = useCallback(
    async ({ landscape = true } = {}) => {
      const el = ref.current
      if (!el) return
      try {
        if (el.requestFullscreen) await el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
        else {
          // iOS iPhone fallback: fill the viewport with CSS
          el.classList.add(CSS_FS)
          setIsFullscreen(true)
        }
      } catch {
        el.classList.add(CSS_FS)
        setIsFullscreen(true)
      }
      if (landscape) {
        try {
          await window.screen.orientation?.lock?.('landscape')
        } catch {
          /* lock needs fullscreen and is not supported everywhere */
        }
      }
    },
    [ref]
  )

  const exit = useCallback(async () => {
    const el = ref.current
    if (fsElement()) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen()
        else document.webkitExitFullscreen?.()
      } catch {
        /* already exited */
      }
    }
    if (el?.classList.contains(CSS_FS)) {
      el.classList.remove(CSS_FS)
      setIsFullscreen(false)
    }
    unlockOrientation()
  }, [ref])

  const toggle = useCallback(
    (opts) => (isFullscreen ? exit() : enter(opts)),
    [isFullscreen, enter, exit]
  )

  return { isFullscreen, isPortrait, showRotateHint: isFullscreen && isPortrait, enter, exit, toggle }
}
