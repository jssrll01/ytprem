import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'

// Holds My List and watch progress (used for Resume and Continue Watching)
const MyListContext = createContext(null)

export function MyListProvider({ children }) {
  const [list, setList] = useLocalStorage('yt.mylist', [])
  const [progress, setProgress] = useLocalStorage('yt.progress', {})

  const has = useCallback((id) => list.includes(id), [list])
  const toggle = useCallback(
    (id) => setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
    [setList]
  )
  const clearList = useCallback(() => setList([]), [setList])

  const saveProgress = useCallback(
    (id, time, duration) =>
      setProgress((prev) => ({ ...prev, [id]: { t: Math.floor(time), d: Math.floor(duration), at: Date.now() } })),
    [setProgress]
  )
  const removeProgress = useCallback(
    (id) =>
      setProgress((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      }),
    [setProgress]
  )
  const clearHistory = useCallback(() => setProgress({}), [setProgress])

  const continueWatching = useMemo(
    () =>
      Object.entries(progress)
        .filter(([, p]) => p.t > 5 && p.d > 0 && p.t / p.d < 0.95)
        .sort((a, b) => b[1].at - a[1].at)
        .map(([id, p]) => ({ id, ...p })),
    [progress]
  )

  const value = useMemo(
    () => ({ list, has, toggle, clearList, progress, saveProgress, removeProgress, clearHistory, continueWatching }),
    [list, has, toggle, clearList, progress, saveProgress, removeProgress, clearHistory, continueWatching]
  )
  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>
}

export function useMyList() {
  const ctx = useContext(MyListContext)
  if (!ctx) throw new Error('useMyList must be used inside MyListProvider')
  return ctx
}
