/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Soft Pink / Pastel Palette ──
        rose: {
          25:  '#FFF8F8',
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
        },
        blush: {
          50:  '#FDF2F4',
          100: '#FAE6EA',
          200: '#F5CDD5',
          300: '#EDA8B5',
          400: '#E07A90',
          500: '#C9556E',
        },
        petal: {
          50:  '#FEF6F7',
          100: '#FDEAED',
          200: '#FAD5DB',
          300: '#F5B0BB',
          400: '#EE8096',
          500: '#E45070',
        },
        cream: {
          50:  '#FFFDF9',
          100: '#FFF9F0',
          200: '#FFF2DC',
          300: '#FFE8C0',
          400: '#FFD98A',
        },
        mauve: {
          50:  '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
        },
        // Neutral warm
        warm: {
          50:  '#FAFAF9',
          100: '#F5F4F2',
          200: '#EAE8E4',
          300: '#D6D3CE',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Serif Devanagari', 'serif'],
      },
      boxShadow: {
        'soft':    '0 2px 15px rgba(244,63,94,0.08)',
        'soft-md': '0 4px 25px rgba(244,63,94,0.12)',
        'soft-lg': '0 8px 40px rgba(244,63,94,0.15)',
        'warm':    '0 2px 15px rgba(60,40,30,0.07)',
        'warm-md': '0 4px 25px rgba(60,40,30,0.10)',
        'warm-lg': '0 8px 40px rgba(60,40,30,0.12)',
        'card':    '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(244,63,94,0.07)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(244,63,94,0.12)',
        'inner-soft': 'inset 0 1px 4px rgba(244,63,94,0.08)',
      },
      backgroundImage: {
        'gradient-rose':   'linear-gradient(135deg, #FFF1F2 0%, #FDF2F4 50%, #FAF5FF 100%)',
        'gradient-petal':  'linear-gradient(135deg, #FFF8F8 0%, #FFF1F2 40%, #FFF9F0 100%)',
        'gradient-hero':   'linear-gradient(to right, rgba(20,10,15,0.75) 0%, rgba(20,10,15,0.35) 55%, transparent 100%)',
        'gradient-card':   'linear-gradient(to top, rgba(20,10,15,0.80) 0%, rgba(20,10,15,0.20) 55%, transparent 100%)',
        'gradient-soft':   'linear-gradient(180deg, #FFF8F8 0%, #FFFFFF 100%)',
        'gradient-footer': 'linear-gradient(180deg, #FDF2F4 0%, #FFF1F2 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'float':      'float 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'drift':      'drift 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(2%,3%) scale(1.03)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
