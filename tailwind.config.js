/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Krub', 'sans-serif'],
    },
    extend: {
      screens: {
        'tablet': '640px',
        // => @media (min-width: 640px) { ... }
  
        'laptop': '1024px',
        // => @media (min-width: 1024px) { ... }
  
        'desktop': '1280px',
        // => @media (min-width: 1280px) { ... }
      },
      colors:{
        brand: {
          300: '#996DFF',
          500: '#8257e6',
        }
      },
      borderRadius: {
        md: '4px'
      }
    
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "cupcake", "synthwave"],
  },
}
