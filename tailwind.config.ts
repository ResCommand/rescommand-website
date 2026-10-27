// tailwind.config.ts
// ResCommand Design System - Tailwind Configuration
// Ink on paper, one signal color. Values live in styles/theme.css.

import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const huge = { lineHeight: '0.95', letterSpacing: '-0.045em', fontWeight: '800' }

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Channel form so opacity modifiers (bg-paper/90) work
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        grey: {
          DEFAULT: 'var(--grey)', // Supporting text
          light: 'var(--grey-light)', // Metadata, captions
        },
        line: 'var(--line)', // Hairline dividers
        ghost: 'var(--ghost)', // Faint layered background word
        signal: {
          DEFAULT: 'var(--signal)', // Buttons, links, active nav — nothing else
          hover: 'var(--signal-hover)',
        },
        danger: 'var(--danger)', // Form errors only
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // Huge lines — one per section
        hero: ['clamp(44px, 7vw, 92px)', { ...huge, lineHeight: '0.92', letterSpacing: '-0.05em' }],
        huge: ['clamp(40px, 5vw, 64px)', huge],

        // Everything else stays small
        body: ['17px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.55' }],
        label: ['12px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      maxWidth: {
        container: '1200px',
        text: '640px',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom component utilities for common layout patterns
    function ({ addComponents }: { addComponents: (components: Record<string, unknown>) => void }) {
      addComponents({
        // Centered, max-width container with a 16px mobile gutter
        '.container-safe': {
          '@apply mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8': {},
        },
        // Full-width section with generous vertical rhythm
        '.section': {
          '@apply w-full py-20 sm:py-28 lg:py-32': {},
        },
      })
    },
  ],
}

export default config
