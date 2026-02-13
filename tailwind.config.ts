import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Trust & Growth" Palette
        os: {
          'deep-space': '#0A1128',
          'neon-mint': '#00F5A0',
          'glass': '#F8FAFC',
          'obsidian': '#1E293B',
        },
        // Semantic colors for compliance
        compliance: {
          critical: {
            bg: '#FEE2E2',
            text: '#B91C1C',
            border: '#FCA5A5',
          },
          warning: {
            bg: '#FEF3C7',
            text: '#B45309',
            border: '#FCD34D',
          },
          success: {
            bg: '#DCFCE7',
            text: '#15803D',
            border: '#86EFAC',
          },
          info: {
            bg: '#E0F2FE',
            text: '#0369A1',
            border: '#7DD3FC',
          },
        },
        // Brand colors extended
        primary: {
          50: '#E6FFF7',
          100: '#B3FFE8',
          200: '#80FFD9',
          300: '#4DFFCA',
          400: '#1AFFBB',
          500: '#00F5A0', // neon-mint
          600: '#00C280',
          700: '#009060',
          800: '#005D40',
          900: '#002B20',
        },
        secondary: {
          50: '#E8ECF4',
          100: '#D1D9E9',
          200: '#A3B3D3',
          300: '#758DBD',
          400: '#4767A7',
          500: '#0A1128', // deep-space
          600: '#080E20',
          700: '#060A18',
          800: '#040710',
          900: '#020308',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-sans)', 'monospace'],
      },
      borderRadius: {
        'os': '8px',
        'os-lg': '12px',
      },
      boxShadow: {
        'os': '0 1px 3px 0 rgba(10, 17, 40, 0.1), 0 1px 2px -1px rgba(10, 17, 40, 0.1)',
        'os-md': '0 4px 6px -1px rgba(10, 17, 40, 0.1), 0 2px 4px -2px rgba(10, 17, 40, 0.1)',
        'os-lg': '0 10px 15px -3px rgba(10, 17, 40, 0.1), 0 4px 6px -4px rgba(10, 17, 40, 0.1)',
        'os-xl': '0 20px 25px -5px rgba(10, 17, 40, 0.1), 0 8px 10px -6px rgba(10, 17, 40, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
