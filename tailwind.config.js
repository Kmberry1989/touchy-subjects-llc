/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBFBFA",
        ink: "#121212",
        purple: "#8B5CF6",
        blue: "#3B82F6",
        green: "#10B981",
        orange: "#F59E0B",
        red: "#EF4444"
      },
      fontFamily: {
        body: ['"Manrope"', '"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Syne"', '"Arial Black"', "sans-serif"]
      },
      boxShadow: {
        hero: "0 50px 100px rgba(0, 0, 0, 0.2)",
        float: "0 40px 80px rgba(0, 0, 0, 0.15)"
      },
      transitionTimingFunction: {
        dramatic: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};
