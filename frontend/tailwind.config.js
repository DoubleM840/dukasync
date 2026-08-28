/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'board-green': '#1F3D2E',
        chalk: '#F6F3EA',
        paper: '#EFEAE0',
        'sokoni-green': '#4B7F52',
        'signal-amber': '#E8A33D',
        'duka-red': '#C2452D',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '3px',
        md: '4px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        full: '9999px',
      },
    },
  },
}
