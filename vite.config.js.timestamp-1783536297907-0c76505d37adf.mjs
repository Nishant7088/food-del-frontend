// vite.config.js
import { defineConfig } from "file:///E:/frontend/react/FOOD-DEL/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///E:/frontend/react/FOOD-DEL/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { ViteImageOptimizer } from "file:///E:/frontend/react/FOOD-DEL/frontend/node_modules/vite-plugin-image-optimizer/dist/index.mjs";
var vite_config_default = defineConfig({
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
        quality: 75
      },
      jpeg: {
        quality: 75
      },
      jpg: {
        quality: 75
      },
      webp: {
        lossless: false,
        quality: 75
      },
      cache: true,
      cacheLocation: ".image-cache"
    })
  ],
  build: {
    // "Legacy JavaScript" fix — modern target skips old-browser polyfills
    target: "es2020",
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["axios", "react-toastify"]
        }
      }
    },
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600
  },
  server: {
    host: true,
    port: 5173,
    // Customer-facing site — always this port
    strictPort: true
    // Fail loudly instead of silently switching ports
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true
  },
  esbuild: {
    target: "es2020"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxmcm9udGVuZFxcXFxyZWFjdFxcXFxGT09ELURFTFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcZnJvbnRlbmRcXFxccmVhY3RcXFxcRk9PRC1ERUxcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L2Zyb250ZW5kL3JlYWN0L0ZPT0QtREVML2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IFZpdGVJbWFnZU9wdGltaXplciB9IGZyb20gJ3ZpdGUtcGx1Z2luLWltYWdlLW9wdGltaXplcidcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG5cbiAgICAvKlxuICAgICAgXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gICAgICBQRVJGT1JNQU5DRSBGSVggXHUyMDE0IFwiSW1wcm92ZSBpbWFnZSBkZWxpdmVyeVwiICgyLDIyOSBLaUIgc2F2aW5ncylcbiAgICAgIFRoaXMgaXMgQlkgRkFSIHRoZSBiaWdnZXN0IHdpbiBhdmFpbGFibGUuIFRoaXMgcGx1Z2luXG4gICAgICBhdXRvbWF0aWNhbGx5IGNvbXByZXNzZXMgZXZlcnkgUE5HL0pQRyB0aGF0IGdldHMgYnVuZGxlZFxuICAgICAgZHVyaW5nIGBucG0gcnVuIGJ1aWxkYCwgd2l0aCB6ZXJvIGNoYW5nZXMgbmVlZGVkIHRvIHlvdXJcbiAgICAgIDxpbWc+IHRhZ3Mgb3IgYXNzZXRzLmpzIFx1MjAxNCBWaXRlIHN3YXBzIGluIHRoZSBjb21wcmVzc2VkXG4gICAgICB2ZXJzaW9uIHRyYW5zcGFyZW50bHkgYXQgYnVpbGQgdGltZS5cblxuICAgICAgVHlwaWNhbCBzYXZpbmdzOiBQTkcgcGhvdG9zIHJlLWVuY29kZWQgYXMgb3B0aW1pemVkIFBORy9XZWJQXG4gICAgICBzaHJpbmsgYnkgNjAtODUlIHdpdGggbm8gdmlzaWJsZSBxdWFsaXR5IGxvc3MuXG4gICAgICBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAgICAqL1xuICAgIFZpdGVJbWFnZU9wdGltaXplcih7XG4gICAgICBwbmc6IHtcbiAgICAgICAgcXVhbGl0eTogNzUsXG4gICAgICB9LFxuICAgICAganBlZzoge1xuICAgICAgICBxdWFsaXR5OiA3NSxcbiAgICAgIH0sXG4gICAgICBqcGc6IHtcbiAgICAgICAgcXVhbGl0eTogNzUsXG4gICAgICB9LFxuICAgICAgd2VicDoge1xuICAgICAgICBsb3NzbGVzczogZmFsc2UsXG4gICAgICAgIHF1YWxpdHk6IDc1LFxuICAgICAgfSxcbiAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgY2FjaGVMb2NhdGlvbjogJy5pbWFnZS1jYWNoZScsXG4gICAgfSksXG4gIF0sXG5cbiAgYnVpbGQ6IHtcbiAgICAvLyBcIkxlZ2FjeSBKYXZhU2NyaXB0XCIgZml4IFx1MjAxNCBtb2Rlcm4gdGFyZ2V0IHNraXBzIG9sZC1icm93c2VyIHBvbHlmaWxsc1xuICAgIHRhcmdldDogJ2VzMjAyMCcsXG5cbiAgICBhc3NldHNJbmxpbmVMaW1pdDogODE5MixcblxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICd1aS12ZW5kb3InOiBbJ2F4aW9zJywgJ3JlYWN0LXRvYXN0aWZ5J10sXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gIH0sXG5cbiAgc2VydmVyOiB7XG4gICAgaG9zdDogdHJ1ZSxcbiAgICBwb3J0OiA1MTczLCAgICAgICAvLyBDdXN0b21lci1mYWNpbmcgc2l0ZSBcdTIwMTQgYWx3YXlzIHRoaXMgcG9ydFxuICAgIHN0cmljdFBvcnQ6IHRydWUsICAvLyBGYWlsIGxvdWRseSBpbnN0ZWFkIG9mIHNpbGVudGx5IHN3aXRjaGluZyBwb3J0c1xuICB9LFxuXG4gIHByZXZpZXc6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDQxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcblxuICBlc2J1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIwJ1xuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVMsU0FBUyxvQkFBb0I7QUFDbFUsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsMEJBQTBCO0FBRW5DLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBZU4sbUJBQW1CO0FBQUEsTUFDakIsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSCxTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsTUFBTTtBQUFBLFFBQ0osVUFBVTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE9BQU87QUFBQSxNQUNQLGVBQWU7QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRO0FBQUEsSUFFUixtQkFBbUI7QUFBQSxJQUVuQixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsVUFDekQsYUFBYSxDQUFDLFNBQVMsZ0JBQWdCO0FBQUEsUUFDekM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sWUFBWTtBQUFBO0FBQUEsRUFDZDtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
