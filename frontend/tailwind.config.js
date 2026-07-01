/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
