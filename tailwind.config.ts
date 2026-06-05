import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        night: {
          50:  "#f0f4ff",
          100: "#e0e8ff",
          200: "#c2d0ff",
          300: "#a3b8ff",
          400: "#849fff",
          500: "#6587ff",
          600: "#4a6fee",
          700: "#3358cc",
          800: "#1e3a8a",
          900: "#0d0b2e",
          950: "#07061a",
        },
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #07061a 0%, #0d0b2e 40%, #1a1040 70%, #0a1628 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gold-gradient": "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)",
        "aurora": "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(251,191,36,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.08) 0%, transparent 50%), linear-gradient(135deg, #07061a 0%, #0d0b2e 40%, #1a1040 70%, #0a1628 100%)",
      },
      boxShadow: {
        "glow-gold": "0 0 30px rgba(251,191,36,0.25), 0 0 60px rgba(251,191,36,0.10)",
        "glow-emerald": "0 0 30px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.10)",
        "card": "0 4px 24px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.10)",
        "glass": "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
        "moon-glow": "moonGlow 3s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "spin-reverse": "spinReverse 18s linear infinite",
        "marquee": "marquee 30s linear infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "bounce-subtle": "bounceSub 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.35s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        moonGlow: {
          "0%, 100%": { boxShadow: "0 0 30px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.2)" },
          "50%": { boxShadow: "0 0 50px rgba(251,191,36,0.7), 0 0 100px rgba(251,191,36,0.35)" },
        },
        spinReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSub: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionDuration: {
        "350": "350ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
