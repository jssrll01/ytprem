import { readFileSync, writeFileSync } from 'node:fs'
import { META } from '../src/data/meta.js'
import { check } from './verify-ids.mjs'

const [slug, link] = process.argv.slice(2)
const slugs = META.map((m) => m.slug)

if (!slug || !link || !slugs.includes(slug)) {
  console.log('Usage: npm run add-id <slug> <youtube-link>\n\nSlugs:\n' + slugs.join('\n'))
  process.exit(1)
}

const match = link.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || link.match(/^([\w-]{11})$/)
if (!match) {
  console.log('Could not read a YouTube ID from that link.')
  process.exit(1)
}

const id = match[1]
const r = await check(id)
if (!r.ok) {
  console.log(`Rejected ${id}: ${r.note}`)
  process.exit(1)
}

const file = 'src/data/ids.json'
const ids = JSON.parse(readFileSync(file, 'utf8'))
ids[slug] = id
writeFileSync(file, JSON.stringify(ids, null, 2) + '\n')
console.log(`Saved ${slug} -> ${id}\nVideo: ${r.note}\nCheck this is the right film and an official or legitimate uploader.`)
