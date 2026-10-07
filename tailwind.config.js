/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#faf7f2",
        ink: { DEFAULT: "#14182b", soft: "#4a5068", mute: "#7b8099" },
        saffron: {
          50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
          400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
        },
        research: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 400: "#818cf8",
          500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,24,43,.04), 0 8px 24px -8px rgba(20,24,43,.10)",
        lift: "0 2px 4px rgba(20,24,43,.05), 0 20px 40px -12px rgba(79,70,229,.22)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(.6)", opacity: "0" },
          "70%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        rise: "rise .5s ease-out both",
        pop: "pop .35s ease-out both",
      },
    },
  },
  plugins: [],
};
