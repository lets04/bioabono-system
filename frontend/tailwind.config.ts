import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bio: {
          dark: "#24421f",
          // ≥ 4.5:1 con blanco y crema (WCAG AA para texto normal)
          green: "#467d2a",
          light: "#a9d17a",
          cream: "#f8f7f0"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
