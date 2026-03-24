/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c6fd',
          300: '#a5a7fc',
          400: '#8b87fa',
          500: '#667eea',  /* primary */
          600: '#5a6fd6',
          700: '#764ba2',  /* secondary / gradient end */
          800: '#3730a3',
          900: '#1e1b4b',
        },
        hero: {
          dark:  '#0F2027',
          mid:   '#203A43',
          light: '#2C5364',
        },
        success: '#00a699',
      },
      borderRadius: {
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      boxShadow: {
        premium: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        card:    '0 20px 35px -12px rgba(0, 0, 0, 0.15)',
        btn:     '0 4px 12px rgba(102, 126, 234, 0.3)',
        'btn-hover': '0 8px 20px rgba(102, 126, 234, 0.4)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'hero-gradient':  'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      },
    },
  },
  plugins: [],
}
