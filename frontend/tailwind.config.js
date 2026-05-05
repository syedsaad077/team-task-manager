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
          DEFAULT: '#4f46e5', // indigo-600
          light: '#818cf8', // indigo-400
          dark: '#3730a3', // indigo-800
        },
        secondary: '#64748b', // slate-500
        background: '#f8fafc', // slate-50
      }
    },
  },
  plugins: [],
}
