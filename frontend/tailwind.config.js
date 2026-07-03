/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
      colors: {
        navy: {
          950: '#0a0c1a',
          900: '#0d1025',
          800: '#141728',
          700: '#1a1e35',
          600: '#232840',
        },
        periwinkle: {
          400: '#9b9ff5',
          500: '#7b7fe8',
          600: '#6366d8',
        },
      },
    },
  },
  plugins: [],
}
