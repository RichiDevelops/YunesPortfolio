/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: "var(--brand)",
        "brand-foreground": "var(--brand-foreground)",
        "muted-foreground": "var(--muted-foreground)",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hand: ['ArtPaper', 'Caveat', 'Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
};
