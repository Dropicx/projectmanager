import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "../packages/ui/index.ts",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
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
        // System Colors
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
