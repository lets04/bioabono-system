import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bio: {
          dark: "#24421f",
          green: "#4f8a2f",
          light: "#a9d17a",
          cream: "#f8f7f0",
          olive: "#6b5b21"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
