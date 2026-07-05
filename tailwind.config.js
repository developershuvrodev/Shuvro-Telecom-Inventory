/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Hind Siliguri'", "'Noto Sans Bengali'", "'Inter'", "sans-serif"],
        num: ["'Inter'", "'Hind Siliguri'", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        surface: "var(--surface)",
        "surface-solid": "var(--surface-solid)",
        border: "var(--border)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        "text-faint": "var(--text-faint)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-soft": "var(--accent-soft)",
        amber: "var(--amber)",
        "amber-soft": "var(--amber-soft)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
      },
      boxShadow: {
        sm2: "0 1px 2px rgba(16,24,38,0.04), 0 1px 1px rgba(16,24,38,0.03)",
        md2: "0 8px 24px -8px rgba(16,24,38,0.14), 0 2px 6px rgba(16,24,38,0.05)",
        lg2: "0 24px 48px -16px rgba(16,24,38,0.22), 0 4px 12px rgba(16,24,38,0.06)",
      },
      borderRadius: {
        xl2: "18px",
        "2xl2": "20px",
      },
    },
  },
  plugins: [],
};
