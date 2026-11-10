/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f3f6fb',
          100: '#e4ebf5',
          200: '#c5d4e8',
          300: '#97b0d1',
          400: '#647fa9',
          500: '#41618a',
          600: '#2f4b71',
          700: '#213857',
          800: '#16273f',
          900: '#0d1a2d',
          950: '#080f1b',
        },
        accent: {
          50: '#f7f5fd',
          100: '#eeeafb',
          200: '#dcd4f6',
          300: '#bfb2ee',
          400: '#9d8ce0',
          500: '#8169d0',
          600: '#6b52b5',
          700: '#573f96',
          800: '#46337a',
          900: '#362760',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          300: '#fcd34d',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 26, 45, 0.04), 0 8px 24px -12px rgba(13, 26, 45, 0.12)',
        lift: '0 2px 4px rgba(13, 26, 45, 0.06), 0 20px 40px -16px rgba(13, 26, 45, 0.25)',
      },
    },
  },
  plugins: [],
};
