/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0B1F3A', mid: '#17345C', light: '#294A78' },
        steel:   { DEFAULT: '#2F6FED', light: '#5D8CF2' },
        amber:   { DEFAULT: '#F5A623' },
        mist:    { DEFAULT: '#F5F7FA', 200: '#E6EAF0', 300: '#CDD4DE', 500: '#5B6B80' },
        crimson: { DEFAULT: '#E63946' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: { card: '14px' },
      boxShadow: {
        soft: '0 12px 32px rgba(11, 31, 58, 0.10)',
        stat: '0 4px 20px rgba(11, 31, 58, 0.18)',
        card: '0 2px 12px rgba(11, 31, 58, 0.08)',
      },
    },
  },
  plugins: [],
};
