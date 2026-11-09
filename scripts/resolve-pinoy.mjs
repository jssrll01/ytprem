// Finds full-length movies on official Filipino studio channels and saves them to src/data/pinoy.json.
// Run by hand (not at build). The API key is typed at the prompt and never stored in a file.
import { readFileSync, writeFileSync } from 'node:fs'
import { check } from './verify-ids.mjs'

const KEY = (process.env.YT_API_KEY || '').trim()
if (!KEY) { console.log('[pinoy] YT_API_KEY is not set.'); process.exit(1) }

const FILE = new URL('../src/data/pinoy.json', import.meta.url)
const BASE = 'https://www.googleapis.com/youtube/v3/'
const PER_CHANNEL = Math.max(1, Number(process.env.PINOY_MAX) || 20)
const MIN_MINUTES = 60

// Official channels only. Confirm a channel on YouTube before adding more.
const CHANNELS = [
  ['UCNP49xH_JCwxHIfKdN8dCQw', 'VIVA Films'],
  ['UCJXPK2at5-hqWzsZd7WGYmA', 'VIVA Entertainment'],
  ['UC69I8egELqWywoX5wrh2KxQ', 'Regal Entertainment'],
  ['UC1D36wr10qyCfisHulZ5G8Q', 'ABS-CBN Star Cinema'],
  ['UCI5YsqsHxdSlaj9ORrnu1DA', 'GMA Pictures'],
  ['UCigmsifD9jbSgvQcT5ZXCOQ', 'ABS-CBN Film Restoration'],
  ['UCbaHbu02DtSydvFhrO4t1gg', 'FPJ Productions']
]

const BAD = /\b(trailer|teaser|clips?|scenes?|highlights?|reaction|review|behind the scenes|making of|promo|compilation|episode|lyrics?|music video|soundtrack)\b/i

async function api(path) {
  const r = await fetch(BASE + path + '&key=' + encodeURIComponent(KEY))
  const j = await r.json()
  if (j.error) { const e = new Error(j.error.message); e.code = j.error.code; throw e }
  return j
}
const isoMin = (iso) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '')
  return m ? +(m[1] || 0) * 60 + +(m[2] || 0) + +(m[3] || 0) / 60 : 0
}
const fmt = (min) => { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? `${h}h ${m}m` : `${m}m` }
const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const clean = (t) => {
  const s = decode(t).replace(/\bfull\s*(hd\s*)?(movie|film)\b/gi, '').replace(/\[[^\]]*\]/g, '')
  const part = s.split(/[|•]/).map((x) => x.trim()).find((x) => x.length >= 2) || s.trim()
  return part.replace(/[\s\-–:]+$/, '').replace(/\s{2,}/g, ' ').trim()
}
const yearOf = (title, published) => {
  const m = /\b(19[3-9]\d|20[0-2]\d)\b/.exec(title)
  return m ? +m[1] : new Date(published).getFullYear()
}
// Playable in the Philippines: not blocked there, and if an allow-list exists it includes PH
const okRegion = (rr) => !rr || ((!rr.allowed || rr.allowed.includes('PH')) && !(rr.blocked || []).includes('PH'))

let list = []
try { list = JSON.parse(readFileSync(FILE, 'utf8')) } catch { list = [] }
const have = new Set(list.map((x) => x.youtubeId))
let added = 0

for (const [cid, cname] of CHANNELS) {
  console.log('== ' + cname)
  try {
    const s = await api(`search?part=snippet&type=video&channelId=${cid}&maxResults=50&order=viewCount&videoDuration=long&videoEmbeddable=true&videoSyndicated=true`)
    const ids = (s.items || []).map((i) => i.id && i.id.videoId).filter(Boolean)
    if (!ids.length) { console.log('  nothing found'); continue }
    const v = await api(`videos?part=snippet,contentDetails,status&id=${ids.join(',')}`)
    let n = 0
    for (const x of v.items || []) {
      if (n >= PER_CHANNEL) break
      if (have.has(x.id)) continue
      if (!x.status || x.status.privacyStatus !== 'public' || x.status.embeddable === false) continue
      if (x.snippet.channelId !== cid) continue
      if (!okRegion(x.contentDetails && x.contentDetails.regionRestriction)) continue
      const title = decode(x.snippet.title)
      if (BAD.test(title)) continue
      const min = isoMin(x.contentDetails.duration)
      if (min < MIN_MINUTES) continue
      const ok = await check(x.id)
      if (!ok.ok) { console.log('  skip (embed check failed):', title); continue }
      list.push({
        id: 'pinoy-' + x.id,
        youtubeId: x.id,
        title: clean(title),
        year: yearOf(title, x.snippet.publishedAt),
        rating: 'NR',
        duration: fmt(min),
        genres: ['Pinoy'],
        description: 'Filipino film from ' + cname + '.',
        cast: [],
        channel: cname
      })
      have.add(x.id); n++; added++
      console.log('  ok  ', clean(title), '|', fmt(min))
    }
    console.log(`  ${n} added`)
  } catch (e) {
    console.log('  stop:', e.message)
    if (e.code === 403) { console.log('  (quota or key restriction; keeping what was found)'); break }
  }
}
writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n')
console.log(`[pinoy] added ${added}, total ${list.length}`)
