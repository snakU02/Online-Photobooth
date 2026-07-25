import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "animate-fadeIn",
    "animate-heart-pulse",
    "animate-flash",
    "animate-shutter-flash",
    "peer-ring",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      maxWidth: {
        "8xl": "1400px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shutterFlash: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        heartPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "shutter-flash": "shutterFlash 0.3s ease-out forwards",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        "heart-pulse": "heartPulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
