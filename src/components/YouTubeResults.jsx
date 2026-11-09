import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { readCache, searchEnabled, searchYouTube } from '../lib/ytSearch.js'
import './YouTubeResults.css'

export default function YouTubeResults() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const q = (params.get('q') || '').trim()
  const live = useRef(q)
  live.current = q
  const [items, setItems] = useState(null)
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // A search that was already made costs nothing: show it again straight away
  useEffect(() => {
    setError('')
    const hit = q.length >= 2 ? readCache(q) : null
    setItems(hit ? hit.items : null)
    setNext(hit ? hit.next : '')
  }, [q])

  const run = async (more) => {
    if (busy) return
    setBusy(true)
    setError('')
    const asked = q
    try {
      const data = await searchYouTube(asked, more ? next : '')
      if (live.current !== asked) return
      setItems((prev) => (more && prev ? [...prev, ...data.items.filter((n) => !prev.some((p) => p.id === n.id))] : data.items))
      setNext(data.next)
    } catch (e) {
      if (live.current === asked) setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const play = (v) => nav('/play/' + v.id, { state: { title: v.title, channel: v.channel } })

  if (!searchEnabled || q.length < 2) return null

  return (
    <section className="yts" aria-label="YouTube results">
      <div className="yts__head">
        <h2>From YouTube</h2>
        {items && <span className="yts__src">Results for “{q}”</span>}
      </div>

      {items === null && (
        <button type="button" className="btn btn-play" onClick={() => run(false)} disabled={busy}>
          {busy ? 'Searching…' : `Search YouTube for “${q}”`}
        </button>
      )}
      {error && <p className="yts__err" role="alert">{error}</p>}
      {items && items.length === 0 && <p className="yts__empty">No playable videos found. Try different words.</p>}

      {items && items.length > 0 && (
        <>
          <ul className="yts__grid">
            {items.map((v) => (
              <li key={v.id}>
                <button type="button" className="yts__item" onClick={() => play(v)} aria-label={'Play ' + v.title}>
                  <span className="yts__thumb">
                    <img src={v.thumb} alt="" loading="lazy" />
                    {v.duration && <span className="yts__dur">{v.duration}</span>}
                  </span>
                  <span className="yts__title">{v.title}</span>
                  <span className="yts__chan">{v.channel}</span>
                </button>
              </li>
            ))}
          </ul>
          {next && (
            <div className="yts__more">
              <button type="button" className="btn btn-info" onClick={() => run(true)} disabled={busy}>{busy ? 'Loading…' : 'Load more'}</button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
