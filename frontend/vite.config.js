import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ─────────────────────────────────────────────────────────────
// DEPLOYMENT CONFIG
// Local dev:  frontend talks to http://localhost:5000 (via proxy)
// Production: set VITE_API_URL env variable to your backend URL
//   e.g. on Netlify: VITE_API_URL = https://np-construction-api.onrender.com
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      // In dev, all /api calls are forwarded to the local Express server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    emptyOutDir: true,
  },
});
