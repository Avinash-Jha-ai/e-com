/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#651F2B',
          dark: '#42151D',
          light: '#822C3B',
          soft: '#F4ECEE',
        },
        burgundy: {
          DEFAULT: '#42151D',
          dark: '#2E0E14',
          light: '#5A1D27',
        },
        ivory: {
          DEFAULT: '#FAF7F2',
          warm: '#FAF7F2',
          light: '#FFFFFF',
        },
        cream: {
          DEFAULT: '#F3EDE3',
          dark: '#EBE2D4',
        },
        sand: {
          DEFAULT: '#D9C8B4',
          light: '#E5D8C8',
          dark: '#BCA892',
        },
        charcoal: {
          DEFAULT: '#191716',
          light: '#2C2826',
          muted: '#3F3B38',
        },
        taupe: {
          DEFAULT: '#8B8178',
          light: '#A69E96',
          dark: '#6E655D',
        },
        rose: {
          DEFAULT: '#B9787C',
          light: '#CF999D',
          dark: '#9B5B5F',
        },
        gold: {
          DEFAULT: '#B5965A',
          light: '#CBB27E',
          dark: '#937841',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Manrope"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.2em',
        'subtle': '0.05em',
        'wide-luxury': '0.3em',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(25, 23, 22, 0.05)',
        'card': '0 10px 40px rgba(25, 23, 22, 0.08)',
        'modal': '0 20px 60px rgba(25, 23, 22, 0.15)',
      },
      borderRadius: {
        'brand': '2px',
        'brand-md': '4px',
        'brand-lg': '8px',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
