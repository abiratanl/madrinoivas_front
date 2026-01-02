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
        madriRose: '#E11D48',
        madriGold: '#D97706',
        madriBg: '#F3F4F6',
        madriDark: '#18181B',
      },
    },
  },
  plugins: [],
}