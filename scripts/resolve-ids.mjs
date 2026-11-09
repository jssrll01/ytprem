// Finds a YouTube video for every title in src/data/meta.js and saves it to src/data/ids.json,
// so nothing has to be added by hand. Titles that already have an id are left alone.
// Needs YT_API_KEY in the environment. It is only used here (build time) and is NOT shipped in the app.
import { readFileSync, writeFileSync } from 'node:fs'
import { META } from '../src/data/meta.js'
import { check } from './verify-ids.mjs'

const KEY = (process.env.YT_API_KEY || '').trim()
const FILE = new URL('../src/data/ids.json', import.meta.url)
const BASE = 'https://www.googleapis.com/youtube/v3/'

if (!KEY) {
  console.log('[resolve-ids] YT_API_KEY is not set, skipping. Titles without an id stay hidden.')
  process.exit(0)
}

let ids = {}
try { ids = JSON.parse(readFileSync(FILE, 'utf8')) } catch { ids = {} }

const minutes = (s) => (/(\d+)h/.test(s) ? +/(\d+)h/.exec(s)[1] * 60 : 0) + (/(\d+)m/.test(s) ? +/(\d+)m/.exec(s)[1] : 0)
const isoMin = (iso) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '')
  return m ? +(m[1] || 0) * 60 + +(m[2] || 0) + +(m[3] || 0) / 60 : 0
}
const norm = (t) => String(t || '').toLowerCase().replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim()
const BAD = /\b(trailer|review|reaction|explained|clip|scene|scenes|remake|soundtrack|teaser|analysis|essay|podcast|colorized)\b/

async function api(path) {
  const r = await fetch(BASE + path + '&key=' + encodeURIComponent(KEY))
  const j = await r.json()
  if (j.error) { const e = new Error(j.error.message); e.code = j.error.code; throw e }
  return j
}

async function pick(m) {
  const want = minutes(m.duration)
  const q = encodeURIComponent(`${m.title} ${m.year} full movie`)
  const s = await api(`search?part=snippet&type=video&maxResults=10&videoEmbeddable=true&videoSyndicated=true&q=${q}` + (want >= 25 ? '&videoDuration=long' : ''))
  const found = (s.items || []).map((i) => i.id && i.id.videoId).filter(Boolean)
  if (!found.length) return null
  const v = await api(`videos?part=snippet,contentDetails,status&id=${found.join(',')}`)
  const wantTitle = norm(m.title)
  const scored = []
  for (const x of v.items || []) {
    if (!x.status || x.status.privacyStatus !== 'public' || x.status.embeddable === false) continue
    const rr = x.contentDetails && x.contentDetails.regionRestriction
    if (rr && rr.blocked && rr.blocked.length) continue
    const t = norm(x.snippet.title)
    if (!t.includes(wantTitle)) continue
    let score = 1
    if (BAD.test(t) && !BAD.test(wantTitle)) score -= 4
    if (t.includes(String(m.year))) score += 1
    if (/full (movie|film)/.test(t)) score += 1
    const d = isoMin(x.contentDetails.duration)
    if (want) { const ratio = d / want; if (ratio >= 0.75 && ratio <= 1.4) score += 4; else if (ratio < 0.6) score -= 4 }
    scored.push({ id: x.id, score })
  }
  scored.sort((a, b) => b.score - a.score)
  for (const c of scored.filter((c) => c.score >= 4)) {
    const ok = await check(c.id)               // same embed check as npm run verify-ids
    if (ok.ok) return c.id
  }
  return null
}

const todo = META.filter((m) => !ids[m.slug])
console.log(`[resolve-ids] ${META.length - todo.length} already set, looking up ${todo.length}`)
let added = 0
const missing = []
for (const m of todo) {
  try {
    const id = await pick(m)
    if (id) { ids[m.slug] = id; added++; console.log('  ok  ', m.slug, id) } else { missing.push(m.slug); console.log('  none', m.slug) }
  } catch (e) {
    console.log('  stop:', e.message)
    if (e.code === 403) { console.log('  (quota or key restriction; keeping what was found)'); break }
    missing.push(m.slug)
  }
}
const sorted = Object.fromEntries(Object.entries(ids).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(FILE, JSON.stringify(sorted, null, 2) + '\n')
console.log(`[resolve-ids] added ${added}, total ${Object.keys(sorted).length}/${META.length}` + (missing.length ? `, not found: ${missing.join(', ')}` : ''))
