echo "== stack =="; grep -E '"(react|react-router-dom|vite|hls\.js|video\.js|react-youtube|@vitejs[^"]*)"' package.json
echo; echo "== env names only =="; ls -a | grep -i "^\.env" ; for f in .env .env.local .env.production; do [ -f "$f" ] && sed 's/=.*//' "$f"; done
echo; echo "== files =="; find src public -type f | sort | head -80
echo; echo "== lines per file =="; wc -l src/*.jsx src/*.js src/*/*.jsx src/*/*.js 2>/dev/null | sort -n | tail -15
echo; echo "== player / embed / data source hits =="; grep -rnE "youtube|iframe|embed|videoId|watch\?v=|api/|fetch\(|supabase|youtube\.googleapis|Pinoy|Filipino|region|country" src --include=*.jsx --include=*.js 2>/dev/null | cut -c1-150 | head -60
echo; echo "== routes =="; grep -rnE "<Route|createBrowserRouter|path:" src 2>/dev/null | cut -c1-130 | head -30
echo; echo "== vite.config =="; cat vite.config.js | cut -c1-150 | head -40
