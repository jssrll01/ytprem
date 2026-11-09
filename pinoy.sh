printf "YouTube API key (hidden): "; read -rs YT_API_KEY; echo; export YT_API_KEY
node scripts/resolve-pinoy.mjs
unset YT_API_KEY
