import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ─────────────────────────────────────────────────────────────
// DEPLOYMENT CONFIG
// Local dev:  frontend talks to http://localhost:5000 (via proxy)
// Production: set VITE_API_URL env variable to your backend URL
//   e.g. on Render: VITE_API_URL = https://np-construction.onrender.com
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    emptyOutDir: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Admin-only dependencies ────────────────────────────────
          // recharts + D3 are only used by AdminAnalytics.
          // Isolating them here prevents ~147 KB of D3 from loading
          // on every public page visit.
          if (id.includes('recharts') || id.includes('/d3') || id.includes('d3-')) {
            return 'admin-charts';
          }

          // ── PDF generation ─────────────────────────────────────────
          // jspdf and html2canvas are dynamically imported by Estimator.
          // Do NOT add a manualChunks entry here — doing so causes Vite
          // to add the chunk to <link rel="modulepreload"> in index.html,
          // which overrides the dynamic import() and loads 586 KB eagerly
          // on every page. Let Vite/Rollup handle it automatically so the
          // chunk is only fetched when the PDF button is clicked.

          // ── React ecosystem vendor chunk ───────────────────────────
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'react-vendor';
          }

          // ── framer-motion (animations — About, FAQ, Testimonials) ──
          if (id.includes('framer-motion')) {
            return 'motion';
          }
        },
      },
    },
  },
});
