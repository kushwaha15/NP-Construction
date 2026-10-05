import axios from 'axios';

// ─────────────────────────────────────────────────────────────
// API base URL configuration
//
// • In development: Vite proxy forwards /api → localhost:5000
//   so we leave baseURL empty.
//
// • On Netlify: set environment variable in Netlify dashboard:
//   VITE_API_URL = https://your-app.onrender.com
//   Then all /api calls go to your Render backend.
// ─────────────────────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export default api;
