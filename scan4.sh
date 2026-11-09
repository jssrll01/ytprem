echo "== real build error (first lines) =="; npx --yes vite build 2>&1 | head -n 25 | cut -c1-170
echo; echo "== vite.config rest =="; sed -n 40,120p vite.config.js | cut -c1-160
echo; echo "== render.yaml =="; cat render.yaml 2>/dev/null | sed 's/\(value:\).*/\1 <hidden>/' | head -30
echo; echo "== resolve-ids.mjs =="; cut -c1-170 scripts/resolve-ids.mjs | head -150
echo; echo "== movies.js =="; cat src/data/movies.js | cut -c1-160
