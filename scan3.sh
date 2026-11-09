echo "== ids.json =="; cat src/data/ids.json | head -c 300; echo
echo "== git state =="; git status -sb | head -5; git log --oneline -5
echo "== other id sources =="; ls -la src/data; grep -rln "youtubeId\|ids.json\|VITE_" src scripts 2>/dev/null
echo "== env example (names only) =="; sed 's/=.*//' .env.example
echo "== package scripts =="; grep -A8 '"scripts"' package.json
echo "== Player.jsx 140-330 =="; sed -n 140,330p src/components/Player.jsx | cut -c1-160
