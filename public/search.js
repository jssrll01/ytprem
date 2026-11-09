(function () {
  'use strict';
  var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
  function dec(t) {
    return String(t || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, function (m, e) {
      var k = e.toLowerCase(); if (ENT[k]) return ENT[k];
      var hex = k.slice(0, 2) === '#x';
      var n = k[0] === '#' ? parseInt(hex ? k.slice(2) : k.slice(1), hex ? 16 : 10) : NaN;
      return isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    });
  }
  var BASE = 'https://www.googleapis.com/youtube/v3/';
  var cache = {};

  // Static-site mode: key comes from the build (window.YT_CONFIG). Calls YouTube directly.
  function direct(q, cfg) {
    var term = encodeURIComponent((q + ' ' + (cfg.suffix || '')).trim());
    var key = '&key=' + encodeURIComponent(cfg.key);
    function get(u) { return fetch(BASE + u + key).then(function (r) { return r.json(); }); }
    return get('search?part=snippet&type=video&maxResults=25&videoEmbeddable=true&videoSyndicated=true&q=' + term).then(function (d) {
      if (d.error) { return { ok: false, j: { error: d.error.code === 403 ? 'YouTube quota reached or key not allowed for this site.' : 'Search failed.' } }; }
      var items = (d.items || []).filter(function (i) { return i.id && i.id.videoId; });
      var ids = items.map(function (i) { return i.id.videoId; });
      var verify = ids.length ? get('videos?part=status,contentDetails&id=' + ids.join(',')).catch(function () { return null; }) : Promise.resolve(null);
      return verify.then(function (v) {
        var ok = null;
        if (v && v.items) {
          ok = {};
          v.items.forEach(function (x) {
            var rr = x.contentDetails && x.contentDetails.regionRestriction;
            if (x.status && x.status.privacyStatus === 'public' && x.status.embeddable !== false && !(rr && rr.blocked && rr.blocked.length)) ok[x.id] = 1;
          });
        }
        return { ok: true, j: items.filter(function (i) { return !ok || ok[i.id.videoId]; }).map(function (i) {
          var th = i.snippet.thumbnails || {};
          return { videoId: i.id.videoId, title: dec(i.snippet.title), channel: dec(i.snippet.channelTitle), thumb: (th.medium || th.default || {}).url || '' };
        }) };
      });
    });
  }

  // Server mode: our own /api/search adds the key on the server.
  function viaServer(q) {
    return fetch('/api/search?q=' + encodeURIComponent(q)).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); });
  }

  window.ytSearch = function (q) {
    var k = q.toLowerCase(), c = cache[k];
    if (c && Date.now() - c.t < 600000) return Promise.resolve(c.v);
    var cfg = window.YT_CONFIG || {};
    return (cfg.key ? direct(q, cfg) : viaServer(q)).then(function (v) { if (v.ok) cache[k] = { t: Date.now(), v: v }; return v; });
  };
})();
