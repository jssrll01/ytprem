'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

// Local dev only: read .env if present. On Render, set YT_API_KEY in the dashboard instead.
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach((l) => {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) { /* no .env file */ }

const PORT = process.env.PORT || 3000;
const KEY = process.env.YT_API_KEY || '';
const SUFFIX = (process.env.YT_SEARCH_SUFFIX || '').trim();
const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const cache = new Map();            // query -> { t, data }   saves API quota
const hits = new Map();             // ip -> [timestamps]     basic abuse limit
const TTL = 10 * 60 * 1000;

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 30;
}

async function yt(pathAndQuery) {
  const r = await fetch('https://www.googleapis.com/youtube/v3/' + pathAndQuery + '&key=' + encodeURIComponent(KEY));
  const j = await r.json();
  if (j.error) { const e = new Error(j.error.message || 'YouTube error'); e.status = j.error.code || 502; throw e; }
  return j;
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const dec = (t) => String(t || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (ENT[e.toLowerCase()]) return ENT[e.toLowerCase()];
  const n = e[0] === '#' ? parseInt(e[1] === 'x' || e[1] === 'X' ? e.slice(2) : e.slice(1), e[1] === 'x' || e[1] === 'X' ? 16 : 10) : NaN;
  return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
});

async function search(q) {
  const term = encodeURIComponent((q + ' ' + SUFFIX).trim());
  const data = await yt('search?part=snippet&type=video&maxResults=25&videoEmbeddable=true&videoSyndicated=true&q=' + term);
  const ids = (data.items || []).filter((i) => i.id && i.id.videoId).map((i) => i.id.videoId);
  let ok = new Set(ids);
  if (ids.length) {
    try {
      const d = await yt('videos?part=status,contentDetails&id=' + ids.join(','));
      ok = new Set((d.items || []).filter((v) => v.status && v.status.privacyStatus === 'public' && v.status.embeddable !== false &&
        !(v.contentDetails && v.contentDetails.regionRestriction && v.contentDetails.regionRestriction.blocked && v.contentDetails.regionRestriction.blocked.length)).map((v) => v.id));
    } catch (e) { /* keep unverified list */ }
  }
  return (data.items || []).filter((i) => i.id && ok.has(i.id.videoId)).map((i) => ({
    videoId: i.id.videoId, title: dec(i.snippet.title), channel: dec(i.snippet.channelTitle),
    thumb: (i.snippet.thumbnails && ((i.snippet.thumbnails.medium || i.snippet.thumbnails.default) || {}).url) || '',
  }));
}

const send = (res, code, body, type) => {
  res.writeHead(code, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com; img-src 'self' https://i.ytimg.com data:; connect-src 'self'; style-src 'self'",
  });
  res.end(body);
};

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/health') return send(res, 200, JSON.stringify({ ok: true, keySet: !!KEY }));
  if (u.pathname === '/api/search') {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (limited(ip)) return send(res, 429, JSON.stringify({ error: 'Too many searches. Wait a minute.' }));
    const q = (u.searchParams.get('q') || '').trim().slice(0, 100);
    if (!q) return send(res, 400, JSON.stringify({ error: 'Type something to search.' }));
    if (!KEY) return send(res, 500, JSON.stringify({ error: 'Server has no YT_API_KEY set.' }));
    const k = q.toLowerCase(); const c = cache.get(k);
    if (c && Date.now() - c.t < TTL) return send(res, 200, JSON.stringify(c.data));
    try {
      const data = await search(q);
      cache.set(k, { t: Date.now(), data });
      if (cache.size > 500) cache.delete(cache.keys().next().value);
      return send(res, 200, JSON.stringify(data));
    } catch (e) { return send(res, e.status === 403 ? 503 : 502, JSON.stringify({ error: e.status === 403 ? 'YouTube quota reached. Try again later.' : 'Search failed.' })); }
  }
  // static files, no path escapes
  const rel = u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname).replace(/^\/+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(file, (err, buf) => err ? send(res, 404, 'Not found', 'text/plain') : send(res, 200, buf, TYPES[path.extname(file)] || 'application/octet-stream'));
}).listen(PORT, () => console.log('ytprem on :' + PORT + (KEY ? '' : '  (YT_API_KEY missing)')));
