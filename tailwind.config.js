/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'golf-green': '#15803d',
        'fairway': '#166534',
        'sky-blue': '#0369a1',
        'flag-yellow': '#eab308',
        'rough': '#365314',
        'bunker': '#f5f0e8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
