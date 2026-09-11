/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Service worker: precaches the app shell and runtime-caches GET API
    // calls so the catalog / recommendations remain browsable offline or
    // on a flaky connection. This is the Vite-native equivalent of the
    // workbox-webpack-plugin setup described in the brief - Vite uses
    // Rollup, not webpack, so vite-plugin-pwa (which wraps the same
    // underlying Workbox libraries) is the correct tool here.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Booking Management System',
        short_name: 'Booking',
        description: 'Search and book hotel rooms',
        theme_color: '#1c3d5a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/api/v1/bookings'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'bookings-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 10 },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith('/api/v1/recommendations'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'recommendations-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Lets the dev server forward /api calls straight to the FastAPI
      // backend, avoiding CORS friction during local development.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split vendor code from app code so the vendor bundle (which
        // rarely changes) stays cached across deploys - a simple but
        // effective rendering/loading optimization.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
