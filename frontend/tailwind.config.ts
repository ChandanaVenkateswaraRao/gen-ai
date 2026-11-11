import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnightNavy: '#021861',
        indigo: '#3F51B5',
        babyBlue: '#EAF4FF',
        crimsonRed: '#DC143C',
        white: '#FFFFFF',
        darkNavy: '#101C3A',
        secondaryText: '#647794',
        lightBorder: '#DCE6F2',
        lightBlueHover: '#DCEBFF',
        softNavyBg: '#F3F6FF',
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        midnight: {
          DEFAULT: "var(--midnight-navy)",
        },
        indigoObj: {
          DEFAULT: "var(--indigo)",
          hover: "var(--indigo-hover)",
          light: "var(--baby-blue)",
        },
        crimson: {
          DEFAULT: "var(--crimson-red)",
          hover: "var(--crimson-red-hover)",
        },
        "baby-blue": "var(--baby-blue)",
        border: "var(--border)",
        soft: "var(--baby-blue)",
        dark: "var(--dark-text)",
        secondary: "var(--secondary-text)",
      },
      borderRadius: {
        sm: "5px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        panel: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 30px rgba(63, 81, 181, 0.12)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        poppins: ["Poppins", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
