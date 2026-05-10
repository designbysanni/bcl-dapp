/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#040D1A",
          surface: "#0A1929",
          elevated: "#0F2744",
        },
        accent: {
          cyan: "#00C6FF",
          purple: "#A855F7",
          green: "#00FF94",
        },
        "text-primary": "#F1F5F9",
        "text-secondary": "#94A3B8",
        "text-muted": "#475569",
        border: {
          subtle: "rgba(0,198,255,0.15)",
          strong: "rgba(0,198,255,0.35)",
        },
        status: {
          success: "#00FF94",
          warning: "#FBBF24",
          error: "#F87171",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 198, 255, 0.06)",
        glow: "0 0 40px rgba(0, 198, 255, 0.15)",
        "glow-sm": "0 0 20px rgba(0, 198, 255, 0.10)",
        "glow-purple": "0 0 40px rgba(168, 85, 247, 0.15)",
        "glow-green": "0 0 20px rgba(0, 255, 148, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,198,255,0.12) 0%, transparent 60%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(0,198,255,0.05) 0%, rgba(168,85,247,0.05) 100%)",
        "gradient-cyan-purple":
          "linear-gradient(135deg, #00C6FF 0%, #A855F7 100%)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.4s ease",
        "counter-tick": "counterTick 0.15s ease",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,198,255,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(0,198,255,0.4)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        counterTick: {
          "0%": { opacity: 0.7 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
