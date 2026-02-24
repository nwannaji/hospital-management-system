/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // International Healthcare Colors
        "medical-primary": "hsl(var(--medical-primary))",
        "medical-success": "hsl(var(--medical-success))",
        "medical-warning": "hsl(var(--medical-warning))",
        "medical-danger": "hsl(var(--medical-danger))",
        "medical-info": "hsl(var(--medical-info))",
        "medical-secondary": "hsl(var(--medical-secondary))",
        // Clinical Status Colors
        "critical": "hsl(var(--critical))",
        "urgent": "hsl(var(--urgent))",
        "stable": "hsl(var(--stable))",
        "recovery": "hsl(var(--recovery))",
        "discharged": "hsl(var(--discharged))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1rem" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "base": ["1rem", { lineHeight: "1.5rem" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'medical-card': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'medical-card-hover': '0 8px 12px -2px rgb(0 0 0 / 0.15)',
        'medical-modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      transitionTimingFunction: {
        'medical-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      screens: {
        'medical-mobile': '640px',
        'medical-tablet': '768px',
        'medical-desktop': '1024px',
        'medical-wide': '1280px',
      },
    },
  },
  plugins: [
    // Add any Tailwind plugins here
  ],
}
