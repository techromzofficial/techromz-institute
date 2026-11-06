/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f7f7f7',
          100: '#f1f1f1',
          200: '#e4e4e4',
          300: '#d8d8d8',
          400: '#8a8a8a',
          500: '#2a2a2a',
          600: '#171717',
          700: '#111111',
          800: '#050505',
          900: '#000000',
        },
        red: {
          50: '#f7f7f7',
          100: '#f1f1f1',
          200: '#e4e4e4',
          300: '#d8d8d8',
          400: '#8a8a8a',
          500: '#2a2a2a',
          600: '#171717',
          700: '#111111',
          800: '#050505',
          900: '#000000',
        },
        accent: {
          50:  '#f7f7f7',
          100: '#f1f1f1',
          400: '#8a8a8a',
          500: '#111111',
          600: '#050505',
          700: '#000000',
        },
        burgundy: 'var(--burgundy)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        canvas: 'var(--canvas)',
        line: 'var(--line)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'Manrope', 'Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
