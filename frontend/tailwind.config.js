/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // --- Brand Theme Colors ---
        navy: {
          DEFAULT: "#10213A",
          900: "#10213A",
          800: "#1A2E4B",
          700: "#243B5E",
          600: "#2E4871",
        },
        indigo: {
          600: "#4F46E5",
          DEFAULT: "#4F46E5",
        },

        // --- Exact Figma Design Tokens ---
        figma: {
          bg: {
            deep: "#000f21",     // Primary page canvas
            card: "#0b1c30",     // Card / container surface
            elevated: "#102034", // Elevated surface / popover / active row
          },
          border: "#1b2b3f",     // Subtle layout border
          text: {
            primary: "#d3e4fe",   // High-contrast cool primary text
            secondary: "#c3c6d7", // Balanced secondary text
            muted: "#8d90a0",     // Subdued metadata & timestamps
          },
          primary: {
            DEFAULT: "#2563eb",  // Core action blue
            light: "#b4c5ff",    // Primary accent light
          },
          success: {
            DEFAULT: "#4edea3",  // Genuine / verified green
            light: "#6ffbbe",    // Success glow / accent
          },
          warning: {
            DEFAULT: "#ffb95f",  // Suspicious / caution amber
            light: "#ffddb8",    // Warning accent
          },
          danger: {
            DEFAULT: "#ffb4ab",  // Fake / danger highlight
            dark: "#93000a",     // Danger dark background
          },
        },

        // --- Backwards-Compatible Semantic Mappings ---
        brand: {
          indigo: "#4F46E5",
          navy: "#10213A",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          glow: "#b4c5ff",
        },
        surface: {
          DEFAULT: "#000f21",
          deep: "#000f21",
          subtle: "#0b1c30",
          card: "#0b1c30",
          panel: "#102034",
          elevated: "#102034",
          border: "#1b2b3f",
          "border-hover": "rgba(211, 228, 254, 0.2)",
          "border-active": "rgba(37, 99, 235, 0.5)",
        },
        genuine: {
          DEFAULT: "#4edea3",
          light: "#6ffbbe",
          muted: "#10b981",
          subtle: "rgba(78, 222, 163, 0.12)",
          border: "rgba(78, 222, 163, 0.3)",
          text: "#4edea3",
        },
        suspicious: {
          DEFAULT: "#ffb95f",
          light: "#ffddb8",
          muted: "#f59e0b",
          subtle: "rgba(255, 185, 95, 0.12)",
          border: "rgba(255, 185, 95, 0.3)",
          text: "#ffb95f",
        },
        fake: {
          DEFAULT: "#ffb4ab",
          dark: "#93000a",
          muted: "#dc2626",
          subtle: "rgba(147, 0, 10, 0.3)",
          border: "rgba(255, 180, 171, 0.3)",
          text: "#ffb4ab",
        },
        info: {
          DEFAULT: "#38bdf8",
          muted: "#0284c7",
          subtle: "rgba(56, 189, 248, 0.12)",
          border: "rgba(56, 189, 248, 0.3)",
          text: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        sora: ["var(--font-sora)", "Sora", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        badge: "2px",
        btn: "4px",
        input: "4px",
        card: "8px",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
      },
      spacing: {
        sidebar: "288px",
        header: "64px",
        content: "992px",
        desktop: "1280px",
      },
      maxWidth: {
        content: "992px",
        desktop: "1280px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.3)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "glow-brand": "0 0 20px -3px rgba(37, 99, 235, 0.35)",
        "glow-success": "0 0 20px -3px rgba(78, 222, 163, 0.35)",
        "glow-warning": "0 0 20px -3px rgba(255, 185, 95, 0.35)",
        "glow-danger": "0 0 20px -3px rgba(255, 180, 171, 0.35)",
      },
    },
  },
  plugins: [],
};
