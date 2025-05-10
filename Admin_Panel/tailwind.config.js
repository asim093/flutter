/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./index.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', 
    theme: {
      extend: {
        colors: {
          amberLight: '#FEF3C7', 
          darkGray: '#111827',   
        },
      },
    },
    plugins: [],
  };
  