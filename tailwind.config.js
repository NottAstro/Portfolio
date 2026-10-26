/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // Desktop screens that are short (e.g. 1366x768 laptops): used to fit
        // full-screen sections without scrolling
        short: { raw: '(min-width: 1024px) and (max-height: 880px)' },
      },
    },
  },
  plugins: [],
}