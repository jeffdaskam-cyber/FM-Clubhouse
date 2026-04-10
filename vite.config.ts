import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/*.png'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.sportradar\.us\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'scoring-api', networkTimeoutSeconds: 10 },
          },
          {
            urlPattern: /^https:\/\/api\.sportsdata\.io\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'scoring-api-sdi', networkTimeoutSeconds: 10 },
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'weather-api' },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
  },
})
