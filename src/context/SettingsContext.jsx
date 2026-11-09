import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  accent: '#E50914',
  cardSize: 'medium',
  reduceMotion: false,
  hoverPreviews: true,
  heroAutoplay: true,
  showTop10: true,
  density: 'comfortable',
  fontSize: 'medium',
  quality: 'auto',
  speed: 1,
  autoplayNext: true,
  resume: true,
  volume: 80,
  captions: false,
  captionSize: 'medium',
  skipSeconds: 10,
  fullscreenOnPlay: false,
  landscapeOnPlay: false,
  dataSaver: false,
  language: 'English',
  region: 'United States'
}

const THEME_COLORS = { dark: '#141414', light: '#f3f3f3', amoled: '#000000' }

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [stored, setStored] = useLocalStorage('yt.settings', DEFAULT_SETTINGS)
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...stored }), [stored])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.cardSize = settings.cardSize
    root.dataset.density = settings.density
    root.dataset.font = settings.fontSize
    root.dataset.reduceMotion = String(settings.reduceMotion)
    root.style.setProperty('--accent', settings.accent)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[settings.theme] || THEME_COLORS.dark)
  }, [settings])

  const update = useCallback(
    (key, value) => setStored((prev) => ({ ...prev, [key]: value })),
    [setStored]
  )
  const reset = useCallback(() => setStored(DEFAULT_SETTINGS), [setStored])

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
