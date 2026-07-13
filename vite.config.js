import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),

    /*
      ══════════════════════════════════════════════════════════
      PERFORMANCE FIX — "Improve image delivery" (2,229 KiB savings)
      This is BY FAR the biggest win available. This plugin
      automatically compresses every PNG/JPG that gets bundled
      during `npm run build`, with zero changes needed to your
      <img> tags or assets.js — Vite swaps in the compressed
      version transparently at build time.

      Typical savings: PNG photos re-encoded as optimized PNG/WebP
      shrink by 60-85% with no visible quality loss.
      ══════════════════════════════════════════════════════════
    */
    ViteImageOptimizer({
      png: {
        quality: 75,
      },
      jpeg: {
        quality: 75,
      },
      jpg: {
        quality: 75,
      },
      webp: {
        lossless: false,
        quality: 75,
      },
      cache: true,
      cacheLocation: '.image-cache',
    }),
  ],

  build: {
    // "Legacy JavaScript" fix — modern target skips old-browser polyfills
    target: 'es2020',

    assetsInlineLimit: 8192,

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['axios', 'react-toastify'],
        }
      }
    },

    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },

  server: {
    host: true,
    port: 5173,       // Customer-facing site — always this port
    strictPort: true,  // Fail loudly instead of silently switching ports
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },

  esbuild: {
    target: 'es2020'
  }
})