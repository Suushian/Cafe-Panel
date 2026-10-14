/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg-2)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
          deep: "var(--primary-deep)",
          glow: "var(--primary-glow)",
        },
        accent: {
          warm: "var(--accent-warm)",
          cream: "var(--accent-cream)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          soft: "var(--text-soft)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
      },
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        "xs": ["0.75rem", { lineHeight: "1.15rem" }],
        "sm": ["0.875rem", { lineHeight: "1.35rem" }],
        "base": ["0.9375rem", { lineHeight: "1.6rem" }],
        "md": ["1rem", { lineHeight: "1.7rem" }],
        "lg": ["1.125rem", { lineHeight: "1.8rem" }],
        "xl": ["1.375rem", { lineHeight: "2rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.625rem", { lineHeight: "2.15rem", letterSpacing: "-0.015em" }],
        "3xl": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],
        "4xl": ["2.5rem", { lineHeight: "3rem", letterSpacing: "-0.025em" }],
        "5xl": ["3.25rem", { lineHeight: "3.75rem", letterSpacing: "-0.03em" }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      letterSpacing: {
        tighter: "-0.025em",
        tight: "-0.015em",
        normal: "0",
        wide: "0.015em",
        wider: "0.03em",
      },
      borderRadius: {
        // Semantic (backwards-compatible)
        card: "24px",
        "card-sm": "16px",
        pill: "999px",
        // Extended
        "3xl": "24px",
        "2xl": "20px",
        "xl": "16px",
        "lg": "14px",
        "md": "10px",
        "sm": "8px",
        "xs": "6px",
      },
      boxShadow: {
        // Semantic (backwards-compatible)
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "card-deep": "var(--shadow-card-deep)",
        glow: "0 0 0 3px var(--primary-glow-15)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.06)",
        // Scale (new)
        "xs": "var(--shadow-xs)",
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
        "xl": "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.04)",
        "ring-soft": "0 0 0 1px rgba(111, 78, 55, 0.08)",
        "ring-medium": "0 0 0 1px rgba(111, 78, 55, 0.16)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-out-soft": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        180: "180ms",
        250: "250ms",
        400: "400ms",
        600: "600ms",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scale(1)" },
          "20%": { opacity: "0.6" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(1.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-up": "fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-down": "fade-down 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-up": "slide-up 350ms cubic-bezier(0.16, 1, 0.3, 1) both",
        steam: "steam 3s ease-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};