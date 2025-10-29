import type { Config } from "tailwindcss";

// Frox Design System - Gray Scale
const froxGray = {
  0: "var(--gray-0)",
  100: "var(--gray-100)",
  200: "var(--gray-200)",
  300: "var(--gray-300)",
  400: "var(--gray-400)",
  500: "var(--gray-500)",
  600: "var(--gray-600)",
  700: "var(--gray-700)",
  800: "var(--gray-800)",
  850: "var(--gray-850)",
  900: "var(--gray-900)",
  1000: "var(--gray-1000)",
  1100: "var(--gray-1100)",
};

// Frox Design System - Accent Colors
const froxAccents = {
  blue: "var(--blue-accent)",
  green: "var(--green-accent)",
  violet: "var(--violet-accent)",
  orange: "var(--orange-accent)",
  yellow: "var(--yellow-accent)",
  indigo: "var(--indigo-accent)",
  emerald: "var(--emerald-accent)",
  fuchsia: "var(--fuchsia-accent)",
  red: "var(--red-accent)",
  sky: "var(--sky-accent)",
  pink: "var(--pink-accent)",
  neutral: "var(--neutral-accent)",
};

// Frox Design System - Typography
const froxTypography = {
  "header-1": ["40px", "60px"] as [string, string],
  "header-2": ["32px", "39px"] as [string, string],
  "header-3": ["28px", "34px"] as [string, string],
  "header-4": ["28px", "34px"] as [string, string],
  "header-5": ["24px", "30px"] as [string, string],
  "header-6": ["20px", "18px"] as [string, string],
  "header-7": ["18px", "22px"] as [string, string],
  normal: ["14px", "16px"] as [string, string],
  subtitle: ["16px", "16px"] as [string, string],
  "subtitle-semibold": ["16px", "20px"] as [string, string],
  "btn-label": ["16px", "16px"] as [string, string],
  "mini-btn-label": ["14px", "12px"] as [string, string],
  desc: ["12px", "16px"] as [string, string],
  "mini-desc": ["9px", "11px"] as [string, string],
};

const config: Config = {
  darkMode: "class", // Frox uses class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "../packages/ui/index.ts",
  ],
  theme: {
    extend: {
      // Custom breakpoints (Frox pattern)
      screens: {
        xs: "500px",
      },
      colors: {
        // Consailt Brand Colors (preserved)
        teal: {
          DEFAULT: "#0e7c7b",
          100: "#031918",
          200: "#063231",
          300: "#084a49",
          400: "#0b6362",
          500: "#0e7c7b",
          600: "#15bfbc",
          700: "#36e9e6",
          800: "#79f0ee",
          900: "#bcf8f7",
        },
        coolGray: {
          DEFAULT: "#a6a4ba",
          100: "#1f1e28",
          200: "#3e3d50",
          300: "#5d5b78",
          400: "#7f7d9d",
          500: "#a6a4ba",
          600: "#b8b7c9",
          700: "#cac9d6",
          800: "#dcdbe4",
          900: "#ededf1",
        },
        tekhelet: {
          DEFAULT: "#521a70",
          100: "#100516",
          200: "#210a2d",
          300: "#311043",
          400: "#411559",
          500: "#521a70",
          600: "#7e28ac",
          700: "#a44ad5",
          800: "#c286e3",
          900: "#e1c3f1",
        },
        maize: {
          DEFAULT: "#fee343",
          100: "#403600",
          200: "#806d01",
          300: "#c0a301",
          400: "#fed803",
          500: "#fee343",
          600: "#fee869",
          700: "#feee8e",
          800: "#fff3b4",
          900: "#fff9d9",
        },
        satinSheenGold: {
          DEFAULT: "#c8a450",
          100: "#2b220d",
          200: "#55441b",
          300: "#806628",
          400: "#ab8836",
          500: "#c8a450",
          600: "#d3b673",
          700: "#dec896",
          800: "#e9dbb9",
          900: "#f4eddc",
        },
        // Frox Gray Scale (for dashboard UI)
        gray: froxGray,
        // Frox Dark Gray Scale
        "gray-dark": {
          0: "var(--dark-gray-0)",
          100: "var(--dark-gray-100)",
          200: "var(--dark-gray-200)",
          300: "var(--dark-gray-300)",
          400: "var(--dark-gray-400)",
          500: "var(--dark-gray-500)",
          600: "var(--dark-gray-600)",
          700: "var(--dark-gray-700)",
          800: "var(--dark-gray-800)",
          850: "var(--dark-gray-850)",
          900: "var(--dark-gray-900)",
          1000: "var(--dark-gray-1000)",
          1100: "var(--dark-gray-1100)",
        },
        // Frox Accent Colors
        ...froxAccents,
        // Frox Brand Color
        "color-brands": "var(--color-brands)",
        // Frox Neutral Backgrounds
        "neutral-bg": "var(--neutral-bg)",
        "neutral-border": "var(--neutral-border)",
        "dark-neutral-bg": "var(--dark-neutral-bg)",
        "dark-neutral-border": "var(--dark-neutral-border)",
        // Shadcn System Colors (preserved)
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Frox Typography
      fontSize: froxTypography,
      // Frox Font Families
      fontFamily: {
        sans: ["Noto Sans", "system-ui", "sans-serif"],
        display: ["Chivo", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
