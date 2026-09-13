/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0B0B0D',
        'secondary-background': '#111114',
        card: '#151518',
        border: '#26262B',
        'primary-text': '#F5F5F5',
        'secondary-text': '#A1A1AA',
        'muted-text': '#71717A',
        accent: {
          DEFAULT: '#84cc16', // lime-500 equivalent for the positive state
          hover: '#65a30d',
        }
      }
    },
  },
  plugins: [],
}
