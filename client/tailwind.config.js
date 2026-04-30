/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary: Deep Rose / Mauve ──
        primary: {
          50:  '#FDF2F4',
          100: '#FAE0E5',
          200: '#F5C0CB',
          300: '#ED8FA3',
          400: '#E06080',
          500: '#C94B6A',   // main CTA
          600: '#A83558',
          700: '#8A2848',
          800: '#6E2039',
          900: '#4A1526',
        },
        // ── Accent: Warm Mauve ──
        mauve: {
          50:  '#F9F0F5',
          100: '#F2DCEA',
          200: '#E5BAD4',
          300: '#D08DB8',
          400: '#B8659A',
          500: '#9B4880',
          600: '#7D3566',
        },
        // ── Neutral: Warm Stone ──
        stone: {
          50:  '#FAFAF9',
          100: '#F5F4F2',
          150: '#EEECEA',
          200: '#E5E2DE',
          300: '#D1CEC9',
          400: '#A8A29C',
          500: '#79736D',
          600: '#57524D',
          700: '#3D3935',
          800: '#28251F',
          900: '#1A1714',
        },
        // ── Background tones ──
        bg: {
          page:    '#F8F5F2',   // warm off-white page
          section: '#F2EEE9',   // slightly deeper section
          card:    '#FFFFFF',
          muted:   '#EDE8E2',
        },
      },
      fontFamily: {
        serif:      ['Playfair Display', 'Georgia', 'serif'],
        sans:       ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Serif Devanagari', 'serif'],
      },
      boxShadow: {
        'xs':      '0 1px 3px rgba(0,0,0,0.06)',
        'sm':      '0 2px 8px rgba(0,0,0,0.07)',
        'md':      '0 4px 20px rgba(0,0,0,0.09)',
        'lg':      '0 8px 32px rgba(0,0,0,0.11)',
        'xl':      '0 16px 48px rgba(0,0,0,0.13)',
        'primary': '0 4px 20px rgba(201,75,106,0.25)',
        'primary-lg': '0 8px 32px rgba(201,75,106,0.30)',
        'inset':   'inset 0 1px 3px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'hero-overlay':  'linear-gradient(to right, rgba(15,8,12,0.80) 0%, rgba(15,8,12,0.45) 50%, rgba(15,8,12,0.10) 100%)',
        'card-overlay':  'linear-gradient(to top, rgba(15,8,12,0.85) 0%, rgba(15,8,12,0.30) 55%, transparent 100%)',
        'section-warm':  'linear-gradient(135deg, #F8F5F2 0%, #F2EEE9 100%)',
        'section-white': 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F6 100%)',
        'primary-grad':  'linear-gradient(135deg, #C94B6A 0%, #A83558 100%)',
        'footer-grad':   'linear-gradient(180deg, #28251F 0%, #1A1714 100%)',
        'sidebar-grad':  'linear-gradient(180deg, #28251F 0%, #1A1714 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up':   'fadeUp 0.55s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'float':     'float 4s ease-in-out infinite',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity:'0', transform:'translateY(18px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
