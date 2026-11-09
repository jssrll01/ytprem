show() { echo; echo "######## $1 ########"; head -n "${2:-80}" "$1" | cut -c1-160; }
show src/pages/Watch.jsx 70
show src/App.jsx 60
show src/main.jsx 40
show src/data/movies.js 50
show src/data/categories.js 60
show src/data/meta.js 40
echo; echo "######## ids.json (shape + size) ########"; wc -c src/data/ids.json; head -c 700 src/data/ids.json; echo
show src/pages/Home.jsx 80
show src/components/Row.jsx 55
echo; echo "######## Player.jsx 1-140 ########"; sed -n 1,140p src/components/Player.jsx | cut -c1-160
