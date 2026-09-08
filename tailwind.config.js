/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'Prompt', 'sans-serif'],
    },
    extend: {
      screens: {
        'tablet': '640px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
      colors: {
        apple: {
          bg: '#f5f5f7',
          card: '#ffffff',
          dark: '#1d1d1f',
          gray: '#86868b',
          lightgray: '#f5f5f7',
          blue: '#0071e3',
          blueHover: '#0077ed',
          border: 'rgba(0, 0, 0, 0.08)',
        },
        brand: {
          300: '#996DFF',
          500: '#8257e6',
        }
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "cupcake", "synthwave"],
  },
}
