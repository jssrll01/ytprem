echo "######## Player.css ########"; cut -c1-170 src/components/Player.css
echo; echo "######## Watch.css ########"; cut -c1-170 src/pages/Watch.css
echo; echo "######## Player.jsx 330-562 ########"; sed -n 330,562p src/components/Player.jsx | cut -c1-170
echo; echo "######## fullscreen hook ########"; sed -n 1,88p src/hooks/useFullscreenLandscape.js | cut -c1-150
