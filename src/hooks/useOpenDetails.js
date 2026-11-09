import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Opens the details modal by setting ?d=<id>, so Back closes it
export default function useOpenDetails() {
  const [params, setParams] = useSearchParams()
  return useCallback(
    (id) => {
      const next = new URLSearchParams(params)
      next.set('d', id)
      setParams(next)
    },
    [params, setParams]
  )
}
