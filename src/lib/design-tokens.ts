/**
 * Compliance OS - Design System Tokens
 * "Trust & Growth" Design System
 *
 * Este archivo centraliza todos los tokens de diseño del sistema
 * para mantener consistencia visual en toda la aplicación.
 */

export const colors = {
  // Core Brand Colors
  brand: {
    deepSpace: '#0A1128',
    neonMint: '#00F5A0',
    glass: '#F8FAFC',
    obsidian: '#1E293B',
  },

  // Semantic Compliance Colors
  compliance: {
    critical: {
      bg: '#FEE2E2',
      text: '#B91C1C',
      border: '#FCA5A5',
      hover: '#FCA5A5',
    },
    warning: {
      bg: '#FEF3C7',
      text: '#B45309',
      border: '#FCD34D',
      hover: '#FCD34D',
    },
    success: {
      bg: '#DCFCE7',
      text: '#15803D',
      border: '#86EFAC',
      hover: '#86EFAC',
    },
    info: {
      bg: '#E0F2FE',
      text: '#0369A1',
      border: '#7DD3FC',
      hover: '#7DD3FC',
    },
  },

  // UI States
  ui: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    disabled: '#94A3B8',
    hover: '#F1F5F9',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif',
    mono: 'var(--font-ibm-plex-sans), monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 3px 0 rgba(10, 17, 40, 0.1), 0 1px 2px -1px rgba(10, 17, 40, 0.1)',
  md: '0 4px 6px -1px rgba(10, 17, 40, 0.1), 0 2px 4px -2px rgba(10, 17, 40, 0.1)',
  lg: '0 10px 15px -3px rgba(10, 17, 40, 0.1), 0 4px 6px -4px rgba(10, 17, 40, 0.1)',
  xl: '0 20px 25px -5px rgba(10, 17, 40, 0.1), 0 8px 10px -6px rgba(10, 17, 40, 0.1)',
} as const;

export const animations = {
  transition: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Helper functions for component styling
export const getComplianceColor = (severity: 'critical' | 'warning' | 'success' | 'info') => {
  return colors.compliance[severity];
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return colors.compliance.success;
  if (score >= 60) return colors.compliance.warning;
  return colors.compliance.critical;
};
