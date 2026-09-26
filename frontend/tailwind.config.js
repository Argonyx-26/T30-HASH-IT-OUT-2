/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        accent: {
          50: '#eef8ff',
          100: '#d8f0ff',
          200: '#b9e4ff',
          300: '#89d2ff',
          400: '#4db9ff',
          500: '#1d9ef5',
          600: '#0a7ad8',
          700: '#0d5ea8',
          800: '#124d88',
          900: '#153f6b',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
