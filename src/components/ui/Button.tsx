import React from 'react';
import { type LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-os-deep-space hover:bg-primary-600 font-semibold shadow-os transition-all duration-300 hover:shadow-os-md',
  secondary: 'bg-os-deep-space text-white hover:bg-secondary-600 font-semibold shadow-os transition-all duration-300',
  ghost: 'border-2 border-gray-200 text-os-obsidian hover:border-primary-500 hover:text-primary-600 transition-all duration-300 bg-white',
  danger: 'bg-compliance-critical-text text-white hover:bg-red-700 font-semibold shadow-os transition-all duration-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-os',
  md: 'px-5 py-2.5 text-base rounded-os',
  lg: 'px-6 py-3 text-lg rounded-os-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 icon-linear" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 icon-linear" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
