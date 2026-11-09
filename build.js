'use strict';
// Render Static Site build: copies public/ to dist/ and writes the key from the environment into dist/config.js.
const fs = require('fs');
const path = require('path');
const key = (process.env.YT_API_KEY || '').trim();
if (!key) { console.error('YT_API_KEY is not set. Add it under Environment on Render, then redeploy.'); process.exit(1); }
const out = path.join(__dirname, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, 'public'), out, { recursive: true });
fs.writeFileSync(path.join(out, 'config.js'), 'window.YT_CONFIG = ' + JSON.stringify({ key, suffix: (process.env.YT_SEARCH_SUFFIX || '').trim() }) + ';\n');
console.log('built dist/ (' + fs.readdirSync(out).length + ' files)');
