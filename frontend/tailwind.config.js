/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          primary: '#0EA5E9',   // Ocean Blue
          secondary: '#14B8A6',  // Teal
          success: '#10B981',    // Emerald
          warning: '#F59E0B',    // Amber
          danger: '#F43F5E',     // Rose
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
