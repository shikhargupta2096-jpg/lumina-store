/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: '#0A0A0B',
        panel: 'rgba(22, 24, 32, 0.85)',
        'panel-solid': '#161820',
        elevated: '#1E2028',
        primary: '#c8a96e',
        'primary-hover': '#e0c289',
        'primary-glow': 'rgba(200, 169, 110, 0.2)',
        main: '#F5F5F5',
        muted: '#6b6980',
        border: 'rgba(200, 169, 110, 0.15)',
        'border-active': 'rgba(200, 169, 110, 0.4)',
        danger: '#ef4444',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
