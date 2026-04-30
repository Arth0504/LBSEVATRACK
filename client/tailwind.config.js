/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary accent: #dd2d4a ──
        accent: {
          50:  '#FFF0F2',
          100: '#FFD6DC',
          200: '#FFADB8',
          300: '#FF7A8A',
          400: '#F04D62',
          500: '#DD2D4A',   // ← main brand color
          600: '#B8203A',
          700: '#92162C',
          800: '#6E1020',
          900: '#4A0A15',
        },
        // ── Neutral grays ──
        gray: {
          25:  '#FAFAFA',
          50:  '#F7F7F7',
          100: '#F0F0F0',
          150: '#E8E8E8',
          200: '#E0E0E0',
          300: '#C4C4C4',
          400: '#9E9E9E',
          500: '#757575',
          600: '#555555',
          700: '#3D3D3D',
          800: '#262626',
          900: '#141414',
        },
      },
      fontFamily: {
        serif:      ['Playfair Display', 'Georgia', 'serif'],
        sans:       ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Serif Devanagari', 'serif'],
      },
      boxShadow: {
        'xs':     '0 1px 3px rgba(0,0,0,0.05)',
        'sm':     '0 2px 8px rgba(0,0,0,0.07)',
        'md':     '0 4px 20px rgba(0,0,0,0.09)',
        'lg':     '0 8px 32px rgba(0,0,0,0.11)',
        'xl':     '0 16px 48px rgba(0,0,0,0.13)',
        'accent': '0 4px 18px rgba(221,45,74,0.28)',
        'accent-lg': '0 8px 30px rgba(221,45,74,0.35)',
        'card':   '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.10)',
      },
      backgroundImage: {
        'accent-grad':   'linear-gradient(135deg, #dd2d4a 0%, #b8203a 100%)',
        'accent-soft':   'linear-gradient(135deg, #fff0f2 0%, #ffd6dc 100%)',
        'hero-overlay':  'linear-gradient(105deg, rgba(10,5,8,0.85) 0%, rgba(10,5,8,0.55) 45%, rgba(10,5,8,0.10) 100%)',
        'card-overlay':  'linear-gradient(to top, rgba(10,5,8,0.88) 0%, rgba(10,5,8,0.30) 55%, transparent 100%)',
        'footer-bg':     'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
        'sidebar-bg':    'linear-gradient(180deg, #1e1e1e 0%, #141414 100%)',
        'section-gray':  'linear-gradient(180deg, #f7f7f7 0%, #f0f0f0 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.55s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'float':      'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 1.4s linear infinite',
        'bg-shift':   'bgShift 12s ease-in-out infinite alternate',
        'orb-1':      'orb1 18s ease-in-out infinite alternate',
        'orb-2':      'orb2 22s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        float:   { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
        bgShift: { '0%': { backgroundPosition:'0% 50%' }, '100%': { backgroundPosition:'100% 50%' } },
        orb1:    { '0%': { transform:'translate(0,0) scale(1)' }, '100%': { transform:'translate(4%,6%) scale(1.08)' } },
        orb2:    { '0%': { transform:'translate(0,0) scale(1)' }, '100%': { transform:'translate(-5%,-4%) scale(1.06)' } },
      },
    },
  },
  plugins: [],
}
