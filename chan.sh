printf "YouTube API key (hidden): "; read -rs YT_API_KEY; echo; export YT_API_KEY
for q in "Viva Films" "Viva Entertainment" "Regal Entertainment" "Star Cinema" "GMA Pictures" "ABS-CBN Film Restoration"; do
  echo "== $q"
  node -e '
    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=3&q="+encodeURIComponent(process.argv[1])+"&key="+process.env.YT_API_KEY)
      .then(r=>r.json()).then(j=>{ if(j.error){console.log("error:",j.error.message);return}
        (j.items||[]).forEach(i=>console.log(i.id.channelId, "|", i.snippet.channelTitle)) })
  ' "$q"
done
unset YT_API_KEY
