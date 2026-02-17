// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Macy's inspired red
        'macys-red': {
          DEFAULT: '#E21A23',
          50: '#FCE8E9',
          100: '#F9D1D3',
          200: '#F3A3A7',
          300: '#ED757B',
          400: '#E7474F',
          500: '#E21A23',
          600: '#B5151C',
          700: '#881015',
          800: '#5B0B0E',
          900: '#2E0507',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};