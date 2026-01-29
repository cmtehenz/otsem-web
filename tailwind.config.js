module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" }
        }
      },
      animation: {
        "fade-in": "fade-in .8s cubic-bezier(.25,.9,.35,1) forwards",
        "shimmer": "shimmer 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
