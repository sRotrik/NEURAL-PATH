/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4338ca',
        secondary: '#0f172a',
        accent: '#38bdf8',
        glass: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
