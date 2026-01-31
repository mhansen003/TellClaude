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
        bg: {
          primary: "#0c0a09",
          secondary: "#1c1917",
          card: "#292524",
          elevated: "#44403c",
        },
        brand: {
          primary: "rgb(var(--brand-primary-rgb) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary-rgb) / <alpha-value>)",
          accent: "rgb(var(--brand-accent-rgb) / <alpha-value>)",
          deep: "rgb(var(--brand-deep-rgb) / <alpha-value>)",
          glow: "var(--brand-glow)",
        },
        accent: {
          purple: "#a855f7",
          blue: "#3b82f6",
          teal: "#14b8a6",
          green: "#22c55e",
          rose: "#f43f5e",
        },
        text: {
          primary: "#fafaf9",
          secondary: "#a8a29e",
          muted: "#78716c",
        },
        border: {
          subtle: "rgba(255,255,255,0.08)",
          brand: "var(--brand-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        pulse_ring: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        fade_in: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(var(--brand-primary-rgb), 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(var(--brand-primary-rgb), 0.5)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(var(--brand-primary-rgb), 0.3), 0 0 30px rgba(var(--brand-primary-rgb), 0.1)",
            borderColor: "rgba(var(--brand-primary-rgb), 0.4)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(var(--brand-primary-rgb), 0.5), 0 0 50px rgba(var(--brand-primary-rgb), 0.2)",
            borderColor: "rgba(var(--brand-primary-rgb), 0.7)"
          },
        },
        "mic-green-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.1)",
            borderColor: "rgba(34, 197, 94, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(34, 197, 94, 0.55), 0 0 50px rgba(34, 197, 94, 0.25)",
            borderColor: "rgba(34, 197, 94, 0.7)",
          },
        },
        "generate-yellow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(250, 204, 21, 0.25), 0 0 20px rgba(250, 204, 21, 0.1)",
            borderColor: "rgba(250, 204, 21, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 18px rgba(250, 204, 21, 0.45), 0 0 35px rgba(250, 204, 21, 0.15)",
            borderColor: "rgba(250, 204, 21, 0.7)",
          },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "suggest-glow": {
          "0%": {
            boxShadow: "0 0 0 rgba(250, 204, 21, 0)",
            backgroundColor: "rgba(250, 204, 21, 0.35)",
            transform: "scale(0.85)",
            opacity: "0",
          },
          "25%": {
            boxShadow: "0 0 14px rgba(250, 204, 21, 0.7), 0 0 28px rgba(250, 204, 21, 0.3)",
            backgroundColor: "rgba(250, 204, 21, 0.25)",
            transform: "scale(1.05)",
            opacity: "1",
          },
          "100%": {
            boxShadow: "0 0 0 rgba(250, 204, 21, 0)",
            backgroundColor: "rgba(var(--brand-primary-rgb), 0.15)",
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        pulse_ring: "pulse_ring 1.5s ease-out infinite",
        fade_in: "fade_in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "mic-green-pulse": "mic-green-pulse 2s ease-in-out infinite",
        "generate-yellow-pulse": "generate-yellow-pulse 2s ease-in-out infinite",
        "suggest-glow": "suggest-glow 0.8s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(135deg, rgb(var(--brand-primary-rgb)) 0%, rgb(var(--brand-secondary-rgb)) 50%, rgb(var(--brand-accent-rgb)) 100%)",
        "dark-gradient": "linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
