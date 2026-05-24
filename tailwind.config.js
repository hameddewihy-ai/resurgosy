/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:     '#1f2a38',
        brand:    '#5979bb',
        cta:      '#f37124',
        cream:    '#f7f1eb',
        charcoal: '#444545',
        dark:     '#0a1422',
        // ── Semantic state colors ─────────────────────────────────
        success:  '#16a34a',
        error:    '#dc2626',
        warning:  '#d97706',
        info:     '#0ea5e9',
        muted:    '#9ca3af',
      },
      fontFamily: {
        sans:    ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 8px 40px rgba(89,121,187,0.28)',
        'cta':   '0 8px 40px rgba(243,113,36,0.28)',
        'card':  '0 4px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'hero-mesh': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(89,121,187,0.22) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
