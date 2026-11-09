import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, scale) {
  const bg = [20, 20, 20]
  const red = [229, 9, 20]
  const cx = size / 2
  const cy = size / 2
  const s = size * scale
  const a = [cx - s * 0.3, cy - s * 0.42]
  const b = [cx - s * 0.3, cy + s * 0.42]
  const c = [cx + s * 0.5, cy]
  const edge = (p, q, x, y) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0])
  const raw = Buffer.alloc((size * 3 + 1) * size)
  let o = 0
  for (let y = 0; y < size; y++) {
    raw[o++] = 0
    for (let x = 0; x < size; x++) {
      const d1 = edge(a, b, x, y)
      const d2 = edge(b, c, x, y)
      const d3 = edge(c, a, x, y)
      const inside = (d1 <= 0 && d2 <= 0 && d3 <= 0) || (d1 >= 0 && d2 >= 0 && d3 >= 0)
      const col = inside ? red : bg
      raw[o++] = col[0]
      raw[o++] = col[1]
      raw[o++] = col[2]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', png(192, 0.7))
writeFileSync('public/icons/icon-512.png', png(512, 0.7))
writeFileSync('public/icons/maskable-512.png', png(512, 0.45))
writeFileSync('public/icons/apple-touch-icon.png', png(180, 0.7))
