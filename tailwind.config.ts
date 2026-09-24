import type { Config } from 'tailwindcss';

/**
 * Design system de Homie.
 * Tokens cálidos (terracota + crema + salvia) pensados para un momento
 * emocionalmente difícil: nada estridente, todo legible.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7F2',
          50: '#FDFBF8',
          100: '#FBF7F2',
          200: '#F4EDE4',
          300: '#EAE0D3',
          400: '#DCCDBA',
        },
        clay: {
          50: '#FBF1EC',
          100: '#F6E2D8',
          200: '#EDC6B4',
          300: '#E0A78D',
          400: '#D08A6A',
          500: '#C06E4D',
          600: '#A65739',
          700: '#86452E',
          800: '#683829',
          900: '#4A2A20',
        },
        sage: {
          50: '#F2F6F1',
          100: '#E3EBE1',
          200: '#C6D6C4',
          300: '#A5BDA3',
          400: '#86A485',
          500: '#6B8C6B',
          600: '#557056',
          700: '#435945',
          800: '#354535',
          900: '#263026',
        },
        ink: {
          DEFAULT: '#2A2521',
          900: '#2A2521',
          700: '#4A423B',
          500: '#6E635A',
          400: '#8C8077',
          300: '#B0A79E',
        },
        honey: {
          200: '#F7E3B8',
          400: '#E8B75C',
          600: '#C7912F',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(2.5rem, 5.8vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-md': ['clamp(2rem, 4.6vw, 3.25rem)', { lineHeight: '1.04', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.125rem)', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '650' }],
        lede: ['clamp(1.0625rem, 1.6vw, 1.25rem)', { lineHeight: '1.55', letterSpacing: '-0.011em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      spacing: {
        'gutter': '1.25rem',
        'section': 'clamp(3.5rem, 9vw, 7rem)',
        'stack': '1.75rem',
      },
      borderRadius: {
        card: '1.25rem',
        panel: '1.75rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,37,33,0.04), 0 8px 24px -12px rgba(42,37,33,0.14)',
        lift: '0 2px 4px rgba(42,37,33,0.05), 0 24px 48px -20px rgba(42,37,33,0.24)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      maxWidth: {
        content: '72rem',
        prose: '34rem',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'spinner-fade': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.15' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'spinner-fade': 'spinner-fade 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
