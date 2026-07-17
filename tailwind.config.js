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
        primary: {
          DEFAULT: '#124680',
          light: '#255ea0',
          dark: '#0a2c53',
        },
        secondary: {
          DEFAULT: '#A5C4F2',
          light: '#CBE0FC',
          dark: '#7FA4D9',
        },
        ivory: {
          DEFAULT: '#FFFFF0',
          dark: '#F0F0E0',
        },
        beige: {
          DEFAULT: '#F5F2EB',
          dark: '#E6E2D8',
        },
        lavender: {
          DEFAULT: '#E6E6FA',
          light: '#F3F3FF',
          dark: '#D3D3F5',
        },
        navy: {
          DEFAULT: '#0A1128',
          light: '#131E3D',
          dark: '#050814',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
