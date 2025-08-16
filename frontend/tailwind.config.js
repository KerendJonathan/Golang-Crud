/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5faff",
          100: "#e0f2ff",
          200: "#b9e4ff",
          300: "#7fd0ff",
          400: "#38b6ff",
          500: "#009eff",
          600: "#007acc",
          700: "#005fa3",
          800: "#004080",
          900: "#00264d",
        },
      },
    },
  },
  plugins: [],
};
