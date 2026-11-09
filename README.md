# ytprem
YouTube search and player. The Google API key never reaches the browser: the page calls `/api/search` and the server adds the key from the `YT_API_KEY` environment variable.

## Run locally
    cp .env.example .env     # then put your key after YT_API_KEY=
    node server.js           # http://localhost:3000

## Deploy on Render
New > Web Service > connect this repo. Build command: `echo ok`. Start command: `node server.js`.
Environment > add `YT_API_KEY` (and optionally `YT_SEARCH_SUFFIX`). Redeploy after changing it.
