import { readFileSync } from 'node:fs'

const ids = JSON.parse(readFileSync('src/data/ids.json', 'utf8'))

export async function check(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`
  const res = await fetch(url)
  if (res.status === 200) {
    const j = await res.json()
    return { ok: true, note: `${j.title} - ${j.author_name}` }
  }
  const reason = res.status === 401 ? 'embedding disabled' : res.status === 404 ? 'not found or private' : `HTTP ${res.status}`
  return { ok: false, note: reason }
}

if (process.argv[1].endsWith('verify-ids.mjs')) {
  const entries = Object.entries(ids)
  if (!entries.length) console.log('ids.json is empty. Use: npm run add-id <slug> <youtube-link>')
  let bad = 0
  for (const [slug, id] of entries) {
    const r = await check(id)
    if (!r.ok) bad++
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${slug} (${id}) ${r.note}`)
  }
  if (bad) process.exitCode = 1
}
