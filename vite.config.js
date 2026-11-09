import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.svg', 'offline.html', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'YT PREMIUM',
        short_name: 'YT PREMIUM',
        description: 'YT PREMIUM streaming app',
        display: 'standalone',
        orientation: 'any',
        background_color: '#141414',
        theme_color: '#141414',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === 'img.youtube.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'yt-thumbs',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ]
})
