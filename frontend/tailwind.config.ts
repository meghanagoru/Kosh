import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Swiss palette
        ink: '#000000',
        paper: '#FFFFFF',
        // International Orange — Value Leaks ONLY
        leak: '#FF4F00',
        // Neutral scale
        rule: '#E0E0E0',       // 1px borders on white bg
        muted: '#767676',      // secondary labels
        dim: '#ADADAD',        // tertiary
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        DEFAULT: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
        none: 'none',
      },
      fontSize: {
        // 12-column typographic scale
        'display': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '900' }],
        'heading': ['clamp(1.5rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '900' }],
        'subheading': ['clamp(1rem, 2vw, 1.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '400' }],
        'data': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1', fontWeight: '700', fontFamily: 'JetBrains Mono' }],
        'data-lg': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1', fontWeight: '700', fontFamily: 'JetBrains Mono' }],
      },
      spacing: {
        // 8px grid
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      transitionTimingFunction: {
        'ease-swiss': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
