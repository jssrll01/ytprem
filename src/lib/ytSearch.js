const KEY = (import.meta.env.VITE_YT_SEARCH_KEY || '').trim()
const BASE = 'https://www.googleapis.com/youtube/v3/'
const TTL_MS = 6 * 60 * 60 * 1000
const PREFIX = 'ytp.search.'

export const searchEnabled = Boolean(KEY)

const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const pad = (n) => String(n).padStart(2, '0')
const fmtDur = (iso) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '')
  if (!m) return ''
  const h = +(m[1] || 0), mi = +(m[2] || 0), s = +(m[3] || 0)
  return h ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`
}

const cacheKey = (q, token) => PREFIX + q.toLowerCase().replace(/\s+/g, ' ').trim() + '|' + (token || '')
export function readCache(q, token = '') {
  try {
    const raw = localStorage.getItem(cacheKey(q, token))
    if (!raw) return null
    const { t, data } = JSON.parse(raw)
    if (Date.now() - t > TTL_MS) { localStorage.removeItem(cacheKey(q, token)); return null }
    return data
  } catch { return null }
}
function writeCache(q, token, data) {
  try { localStorage.setItem(cacheKey(q, token), JSON.stringify({ t: Date.now(), data })) } catch { /* storage full */ }
}

async function call(path) {
  let r
  try { r = await fetch(BASE + path + '&key=' + encodeURIComponent(KEY)) } catch { throw new Error('No connection. Check your internet and try again.') }
  let j = {}
  try { j = await r.json() } catch { /* ignore */ }
  if (!r.ok || j.error) {
    const reason = j.error && j.error.errors && j.error.errors[0] && j.error.errors[0].reason
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded' || reason === 'rateLimitExceeded') throw new Error('The daily search limit was reached. Try again tomorrow.')
    if (reason === 'keyInvalid' || reason === 'ipRefererBlocked' || reason === 'forbidden' || r.status === 400 || r.status === 403) throw new Error('Search is not set up correctly yet.')
    throw new Error('Search failed. Try again.')
  }
  return j
}

const okVideo = (x) => {
  if (!x || !x.status || x.status.privacyStatus !== 'public' || x.status.embeddable === false) return false
  if (x.snippet && x.snippet.liveBroadcastContent === 'upcoming') return false
  const rr = x.contentDetails && x.contentDetails.regionRestriction
  return !rr || ((!rr.allowed || rr.allowed.includes('PH')) && !(rr.blocked || []).includes('PH'))
}

export async function searchYouTube(q, pageToken = '') {
  if (!KEY) throw new Error('Search is not set up yet.')
  const query = q.trim()
  const hit = readCache(query, pageToken)
  if (hit) return hit
  const s = await call(
    `search?part=snippet&type=video&maxResults=12&videoEmbeddable=true&videoSyndicated=true&safeSearch=moderate&regionCode=PH&q=${encodeURIComponent(query)}` +
    (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '')
  )
  const ids = (s.items || []).map((i) => i.id && i.id.videoId).filter(Boolean)
  let items = []
  if (ids.length) {
    const v = await call(`videos?part=snippet,contentDetails,status&id=${ids.join(',')}`)
    const byId = new Map((v.items || []).map((x) => [x.id, x]))
    items = ids.map((id) => byId.get(id)).filter(okVideo).map((x) => ({
      id: x.id,
      title: decode(x.snippet.title),
      channel: decode(x.snippet.channelTitle),
      duration: fmtDur(x.contentDetails.duration),
      thumb: `https://img.youtube.com/vi/${x.id}/mqdefault.jpg`
    }))
  }
  const data = { items, next: s.nextPageToken || '' }
  writeCache(query, pageToken, data)
  return data
}
