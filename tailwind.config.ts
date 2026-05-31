import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Card theme pages use .ec-theme-* namespace — Tailwind does NOT purge or
  // bleed into those classes, keeping the app shell and card themes isolated.
  safelist: [
    { pattern: /^ec-theme-/ },
    { pattern: /^ec-card-/ },
  ],
  theme: {
    extend: {
      // ── Fonts ───────────────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", "serif"],      // Playfair Display — headings
        body:    ["var(--font-body)",    "sans-serif"], // DM Sans — body copy
        arabic:  ["var(--font-arabic)",  "serif"],      // Amiri — Arabic duas
        mono:    ["var(--font-mono)",    "monospace"],  // JetBrains Mono — code/prices
      },

      // ── Colour System ───────────────────────────────────────────────────────
      colors: {
        // Semantic tokens — map to CSS variables so dark mode is automatic
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow:       "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // EidCard brand palette — Islamic-inspired gold, emerald, sapphire
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
          950: "#451a03",
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
          950: "#022c22",
        },
        sapphire: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Night sky palette — used in dark hero sections
        night: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d6fe",
          300: "#a5b8fc",
          400: "#8191f8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#1e1b4b",
          950: "#0d0b2e",
        },
      },

      // ── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        lg:    "var(--radius)",
        md:    "calc(var(--radius) - 2px)",
        sm:    "calc(var(--radius) - 4px)",
      },

      // ── Spacing extras ───────────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "128": "32rem",
        "144": "36rem",
      },

      // ── Typography scale extras ──────────────────────────────────────────────
      fontSize: {
        "10xl": ["10rem",  { lineHeight: "1" }],
        "11xl": ["12rem",  { lineHeight: "1" }],
        "display": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },

      // ── Box Shadow ───────────────────────────────────────────────────────────
      boxShadow: {
        "glow-gold":     "0 0 20px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.15)",
        "glow-emerald":  "0 0 20px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.15)",
        "glow-primary":  "0 0 20px hsl(var(--primary)/0.4), 0 0 60px hsl(var(--primary)/0.15)",
        "glass":         "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-dark":    "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover":    "0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
        "card-premium":  "0 0 0 1px rgba(251,191,36,0.3), 0 20px 60px rgba(251,191,36,0.1)",
        "neu":           "8px 8px 20px rgba(0,0,0,0.08), -8px -8px 20px rgba(255,255,255,0.9)",
        "neu-inset":     "inset 4px 4px 10px rgba(0,0,0,0.08), inset -4px -4px 10px rgba(255,255,255,0.9)",
        "inner-glow":    "inset 0 0 20px rgba(251,191,36,0.15)",
      },

      // ── Backdrop Blur extras ─────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
        "4xl": "60px",
      },

      // ── Keyframes ────────────────────────────────────────────────────────────
      keyframes: {
        // Entrance
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-left": {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-right": {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          "0%":   { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.92)" },
        },
        "slide-in-right": {
          "0%":   { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        "slide-in-left": {
          "0%":   { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",      opacity: "1" },
        },
        "slide-in-bottom": {
          "0%":   { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },

        // Continuous
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(1deg)" },
          "66%":      { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(251,191,36,0.3), 0 0 40px rgba(251,191,36,0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3)" },
        },
        "pulse-glow-emerald": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(16,185,129,0.6), 0 0 80px rgba(16,185,129,0.3)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          "0%":   { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)",     animationTimingFunction: "cubic-bezier(0.8,0,1,1)" },
          "50%":      { transform: "translateY(-6px)",  animationTimingFunction: "cubic-bezier(0,0,0.2,1)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%":      { transform: "rotate(3deg)" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "14%":      { transform: "scale(1.15)" },
          "28%":      { transform: "scale(1)" },
          "42%":      { transform: "scale(1.1)" },
          "70%":      { transform: "scale(1)" },
        },

        // Marquee / ticker
        "marquee": {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%":   { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },

        // Gradient / aurora
        "aurora": {
          "0%":   { backgroundPosition: "0% 50%",   backgroundSize: "200% 200%" },
          "50%":  { backgroundPosition: "100% 50%", backgroundSize: "300% 300%" },
          "100%": { backgroundPosition: "0% 50%",   backgroundSize: "200% 200%" },
        },
        "gradient-shift": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },

        // Progress / reveal
        "progress-fill": {
          "0%":   { width: "0%" },
          "100%": { width: "var(--progress-width, 100%)" },
        },
        "clip-reveal": {
          "0%":   { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        "mask-reveal-up": {
          "0%":   { clipPath: "inset(100% 0 0 0)" },
          "100%": { clipPath: "inset(0% 0 0 0)" },
        },

        // Skeleton
        "skeleton": {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },

        // Confetti pieces (used via JS, but base keyframe here)
        "confetti-fall": {
          "0%":   { transform: "translateY(-100px) rotate(0deg)",   opacity: "1" },
          "100%": { transform: "translateY(100vh)  rotate(720deg)", opacity: "0" },
        },

        // Modal/toast
        "modal-in": {
          "0%":   { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1)    translateY(0)" },
        },
        "toast-in": {
          "0%":   { opacity: "0", transform: "translateX(100%) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0)    scale(1)" },
        },
        "toast-out": {
          "0%":   { opacity: "1", transform: "translateX(0)    scale(1)" },
          "100%": { opacity: "0", transform: "translateX(100%) scale(0.95)" },
        },

        // Kinetic / text
        "text-reveal": {
          "0%":   { opacity: "0", transform: "translateY(100%)",  clipPath: "inset(100% 0 0 0)" },
          "100%": { opacity: "1", transform: "translateY(0%)",    clipPath: "inset(0% 0 0 0)" },
        },
        "letter-pop": {
          "0%":   { opacity: "0", transform: "scale(0.5) translateY(20px)" },
          "60%":  { transform: "scale(1.1) translateY(-4px)" },
          "100%": { opacity: "1", transform: "scale(1)   translateY(0)" },
        },

        // Cursor trail
        "cursor-trail": {
          "0%":   { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },

        // Tilt reset
        "tilt-reset": {
          "0%":   { transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" },
          "100%": { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" },
        },

        // Accordion
        "accordion-down": {
          "0%":   { height: "0", opacity: "0" },
          "100%": { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          "0%":   { height: "var(--radix-accordion-content-height)", opacity: "1" },
          "100%": { height: "0", opacity: "0" },
        },

        // Morphing shapes
        "morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%":      { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        "morph-2": {
          "0%, 100%": { borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%" },
          "50%":      { borderRadius: "60% 40% 40% 60% / 60% 60% 40% 40%" },
        },

        // Crescent moon glow
        "moon-glow": {
          "0%, 100%": {
            boxShadow: "0 0 30px rgba(252,211,77,0.4), 0 0 60px rgba(252,211,77,0.2), 0 0 100px rgba(252,211,77,0.1)"
          },
          "50%": {
            boxShadow: "0 0 50px rgba(252,211,77,0.7), 0 0 100px rgba(252,211,77,0.4), 0 0 150px rgba(252,211,77,0.2)"
          },
        },

        // Star twinkle
        "twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%":      { opacity: "1",   transform: "scale(1.3)" },
        },

        // Neon flicker
        "neon-flicker": {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            textShadow: "0 0 10px hsl(var(--primary)/0.9), 0 0 20px hsl(var(--primary)/0.7), 0 0 40px hsl(var(--primary)/0.5)"
          },
          "20%, 24%, 55%": { textShadow: "none" },
        },

        // Parallax drift
        "parallax-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) rotate(0deg)" },
          "25%":      { transform: "translate(10px, -15px) rotate(1deg)" },
          "50%":      { transform: "translate(-5px, -25px) rotate(-1deg)" },
          "75%":      { transform: "translate(-15px, -10px) rotate(0.5deg)" },
        },
      },

      // ── Animation shortcuts ───────────────────────────────────────────────────
      animation: {
        // Entrance (one-shot)
        "fade-up":          "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-down":        "fade-down 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-left":        "fade-left 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-right":       "fade-right 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":          "fade-in 0.4s ease-out forwards",
        "scale-in":         "scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-out":        "scale-out 0.3s cubic-bezier(0.4,0,1,1) forwards",
        "slide-in-right":   "slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-in-left":    "slide-in-left 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-in-bottom":  "slide-in-bottom 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "clip-reveal":      "clip-reveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "mask-reveal-up":   "mask-reveal-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "text-reveal":      "text-reveal 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "modal-in":         "modal-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "toast-in":         "toast-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "toast-out":        "toast-out 0.25s ease-in forwards",
        "progress-fill":    "progress-fill 0.8s cubic-bezier(0.16,1,0.3,1) forwards",

        // Continuous
        "float":            "float 6s ease-in-out infinite",
        "float-slow":       "float-slow 8s ease-in-out infinite",
        "pulse-glow":       "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-em":    "pulse-glow-emerald 2.5s ease-in-out infinite",
        "shimmer":          "shimmer 2s linear infinite",
        "skeleton":         "skeleton 1.8s linear infinite",
        "spin-slow":        "spin-slow 20s linear infinite",
        "spin-reverse":     "spin-reverse 15s linear infinite",
        "bounce-subtle":    "bounce-subtle 1.5s ease infinite",
        "wiggle":           "wiggle 0.5s ease-in-out",
        "heartbeat":        "heartbeat 1.3s ease-in-out infinite",
        "marquee":          "marquee 25s linear infinite",
        "marquee-slow":     "marquee 40s linear infinite",
        "marquee-reverse":  "marquee-reverse 30s linear infinite",
        "aurora":           "aurora 8s ease infinite",
        "gradient-shift":   "gradient-shift 6s ease infinite",
        "moon-glow":        "moon-glow 3s ease-in-out infinite",
        "twinkle":          "twinkle 2s ease-in-out infinite",
        "neon-flicker":     "neon-flicker 3s infinite",
        "morph":            "morph 8s ease-in-out infinite",
        "morph-2":          "morph-2 10s ease-in-out infinite",
        "parallax-drift":   "parallax-drift 12s ease-in-out infinite",
        "confetti-fall":    "confetti-fall 3s ease-in forwards",
        "cursor-trail":     "cursor-trail 0.6s ease-out forwards",
      },

      // ── Transition Timing ────────────────────────────────────────────────────
      transitionTimingFunction: {
        "spring":     "cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in":  "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
        "smooth-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "expo-out":   "cubic-bezier(0.19, 1, 0.22, 1)",
      },

      // ── Transition Duration ───────────────────────────────────────────────────
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
        "2000": "2000ms",
      },

      // ── Background Size ───────────────────────────────────────────────────────
      backgroundSize: {
        "200%": "200%",
        "300%": "300%",
        "400%": "400%",
      },

      // ── Z-index scale ──────────────────────────────────────────────────────────
      zIndex: {
        "60":  "60",
        "70":  "70",
        "80":  "80",
        "90":  "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};

export default config;
