(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var player = null, ready = false, pending = null, timer = null;

  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    return new Promise(function (resolve) {
      window.onYouTubeIframeAPIReady = resolve;
      var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
  }
  function ensurePlayer() {
    if (player) return Promise.resolve();
    return loadApi().then(function () {
      return new Promise(function (resolve) {
        player = new window.YT.Player('player', {
          width: '100%', height: '100%',
          playerVars: { controls: 0, modestbranding: 1, rel: 0, playsinline: 1, disablekb: 1, fs: 0 },
          events: {
            onReady: function () { ready = true; resolve(); if (pending) { play(pending.id, pending.title); pending = null; } },
            onStateChange: function (e) { $('pp').textContent = e.data === 1 ? 'Pause' : 'Play'; },
            onError: function () { $('msg').textContent = 'That video cannot be played here. Try another.'; }
          }
        });
      });
    });
  }
  function play(id, title) {
    $('stage').hidden = false; $('title').textContent = title; $('msg').textContent = '';
    if (!ready) { pending = { id: id, title: title }; ensurePlayer(); return; }
    player.loadVideoById({ videoId: id, startSeconds: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('pp').addEventListener('click', function () {
    if (!ready) return;
    player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
  });
  $('seek').addEventListener('input', function () {
    if (!ready) return;
    var d = player.getDuration() || 0; player.seekTo(d * (this.value / 1000), true);
  });
  timer = setInterval(function () {
    if (!ready || !player.getDuration) return;
    var d = player.getDuration() || 0, t = player.getCurrentTime() || 0;
    if (document.activeElement !== $('seek')) $('seek').value = d ? Math.round(t / d * 1000) : 0;
    $('time').textContent = fmt(t) + ' / ' + fmt(d);
  }, 500);

  function card(v) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'card';
    var img = document.createElement('img'); img.src = v.thumb; img.alt = ''; img.loading = 'lazy';
    var box = document.createElement('div'), t = document.createElement('b'), c = document.createElement('small');
    t.textContent = v.title; c.textContent = v.channel; box.appendChild(t); box.appendChild(document.createElement('br')); box.appendChild(c);
    b.appendChild(img); b.appendChild(box);
    b.addEventListener('click', function () { play(v.videoId, v.title); });
    return b;
  }

  $('f').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('q').value.trim(); if (!q) return;
    var out = $('results'); out.textContent = ''; $('msg').textContent = '';
    for (var i = 0; i < 8; i++) { var s = document.createElement('div'); s.className = 'skel'; out.appendChild(s); }
    window.ytSearch(q)
      .then(function (x) {
        out.textContent = '';
        if (!x.ok) { $('msg').textContent = x.j.error || 'Search failed.'; return; }
        if (!x.j.length) { $('msg').textContent = 'No playable results.'; return; }
        x.j.forEach(function (v) { out.appendChild(card(v)); });
      }).catch(function () { out.textContent = ''; $('msg').textContent = 'Network problem. Try again.'; });
  });
})();
