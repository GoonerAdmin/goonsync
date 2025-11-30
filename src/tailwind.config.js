/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // X (Twitter) inspired colors
        'x-blue': '#1D9BF0',
        'x-blue-hover': '#1A8CD8',
        'x-gray': '#536471',
        'x-border': '#2F3336',
        'x-hover': '#16181C',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}