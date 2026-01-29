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
        claude: {
          orange: "#ff6b35",
          coral: "#ff8c61",
          amber: "#ffb088",
          deep: "#cc4a1a",
          glow: "rgba(255, 107, 53, 0.15)",
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
          claude: "rgba(255, 107, 53, 0.3)",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 107, 53, 0.5)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.1)",
            borderColor: "rgba(255, 107, 53, 0.4)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(255, 107, 53, 0.5), 0 0 50px rgba(255, 107, 53, 0.2)",
            borderColor: "rgba(255, 107, 53, 0.7)"
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
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "claude-gradient": "linear-gradient(135deg, #ff6b35 0%, #ff8c61 50%, #ffb088 100%)",
        "dark-gradient": "linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
