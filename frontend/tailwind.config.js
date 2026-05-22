/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        traffix: {
          bg: '#0a0f1c',
          card: '#111827',
          border: '#1f2937',
          text: '#f3f4f6',
          muted: '#9ca3af',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
        },
        severity: {
          low: '#10b981',
          medium: '#eab308',
          high: '#f97316',
          critical: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

