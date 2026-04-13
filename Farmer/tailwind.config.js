/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        primaryLight: "#818cf8",
        secondary: "#0f172a",
        background: "#F8F9FB",
        success: "#10B981",
        warning: "#F59E0B",
        critical: "#EF4444",
        info: "#3B82F6",
      },
      borderRadius: {
        'large': '24px',
      }
    },
  },
  plugins: [],
}
