import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-950': 'rgb(var(--color-brand-950) / <alpha-value>)',
        'brand-900': 'rgb(var(--color-brand-900) / <alpha-value>)',
        'brand-700': 'rgb(var(--color-brand-700) / <alpha-value>)',
        'brand-600': 'rgb(var(--color-brand-600) / <alpha-value>)',
        'brand-500': 'rgb(var(--color-brand-500) / <alpha-value>)',
        'brand-200': 'rgb(var(--color-brand-200) / <alpha-value>)',
        'brand-100': 'rgb(var(--color-brand-100) / <alpha-value>)',
        'brand-50': 'rgb(var(--color-brand-50) / <alpha-value>)',
        'accent-500': 'rgb(var(--color-accent-500) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
    },
  },
  plugins: [],
}

export default config
