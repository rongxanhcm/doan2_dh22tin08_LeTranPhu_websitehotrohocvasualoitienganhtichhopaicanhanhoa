import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0f9f9',
          100: '#d9f1f2',
          200: '#b3e3e6',
          300: '#7ccfd5',
          400: '#4cbcc6',
          500: '#378f96', // Brand primary color (matching logo #378F96)
          600: '#2d7880',
          700: '#236268',
          800: '#1a4b51',
          900: '#133439',
          950: '#0a1f24',
        },
      },
    },
  },
  plugins: [],
}

export default config
