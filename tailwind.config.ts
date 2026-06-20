import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "whoop-green": "#00F19F",
        "strain-red": "#FF3D3D",
        "dark-bg": "#141414",
        "darker-bg": "#0B0B0B",
        "luxe-gold": "#D4AF37",
        glass: "rgba(30, 30, 30, 0.75)",
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#2A2A2A',
          850: '#222222',
          900: '#1F1F1F',
          950: '#161616',
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "Bebas Neue", "sans-serif"],
        sans: ["var(--font-inter)", "DM Sans", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "neon-green": "0 0 15px rgba(0, 241, 159, 0.4)",
        "neon-red": "0 0 15px rgba(255, 61, 61, 0.4)",
        "neon-glow": "0 0 20px rgba(0, 241, 159, 0.2)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marching-ants": "ants 1s linear infinite",
        "glow-pulse": "glow 2s ease-in-out infinite alternate",
        "ekg-pulse": "ekg 2.5s ease-in-out infinite",
        "marquee": "marquee 20s linear infinite",
      },
      keyframes: {
        ants: {
          "0%": { "background-position": "0 0" },
          "100%": { "background-position": "28px 0" },
        },
        glow: {
          "0%": { "box-shadow": "0 0 5px rgba(0, 241, 159, 0.2), 0 0 10px rgba(0, 241, 159, 0.1)" },
          "100%": { "box-shadow": "0 0 20px rgba(0, 241, 159, 0.6), 0 0 30px rgba(0, 241, 159, 0.3)" },
        },
        ekg: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.05)" },
          "30%": { transform: "scale(0.9)" },
          "35%": { transform: "scale(1.15)" },
          "40%": { transform: "scale(0.95)" },
          "45%": { transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
