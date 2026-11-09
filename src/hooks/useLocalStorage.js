import { useCallback, useEffect, useRef, useState } from 'react'

export default function useLocalStorage(key, initial) {
  const initialRef = useRef(initial)

  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initialRef.current : JSON.parse(raw)
    } catch {
      return initialRef.current
    }
  }, [key])

  const [value, setValue] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked */
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, read])

  return [value, setValue]
}
