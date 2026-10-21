/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tactical Command Dark Mode palette
        slate: {
          950: '#0a0e1a',
          900: '#0f172a',
          850: '#131b2e',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        command: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          surface: '#0f172a',
        },
        hazard: {
          critical: '#ef4444',
          high: '#f59e0b',
          medium: '#3b82f6',
          low: '#22c55e',
          flood: '#06b6d4',
        },
        status: {
          available: '#22c55e',
          dispatched: '#f59e0b',
          enroute: '#3b82f6',
          offline: '#6b7280',
          open: '#22c55e',
          closed: '#ef4444',
          restricted: '#f59e0b',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'beacon': 'beacon 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        beacon: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
      },
      boxShadow: {
        'command': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
