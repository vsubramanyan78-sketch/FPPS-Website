/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aviation: {
          navy: {
            DEFAULT: '#0B132B',
            darker: '#060B18',
            glowing: '#0f1f44',
          },
          dark: '#1C2541',
          royal: '#3A506B',
          sky: '#00B4D8',
          cyan: '#90E0EF',
          lightBg: '#F4F6F9',
          lightCard: '#FFFFFF',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
