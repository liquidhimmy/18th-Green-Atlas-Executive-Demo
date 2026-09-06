/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        evergreen: "#0F5C4D",
        pine: "#072B24",
        emerald: "#19C37D",
        opemerald: "#18B368",
        teal: "#1AA7A1",
        midnight: "#081018",
        cloud: "#F6F7F9",
        slate2: "#465468",
        bordergray: "#D8DDE6",
        muted: "#EEF2F4",
        violet2: "#7C3AED",
        lavender: "#EDE7FF",
        gold: "#C69214",
        amber2: "#E3A72F",
        verified: "#10B981",
        infoblue: "#3B82F6",
        attention: "#F59E0B",
        risk: "#EF4444",
        archived: "#6B7280",
        draft: "#8B5CF6",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Hanken Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
