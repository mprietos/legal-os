import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false
}) => {
  const baseStyles = 'bg-white rounded-os-lg shadow-os-md transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-os-lg hover:-translate-y-1' : '';
  const glassStyles = glass ? 'glass border border-white/20' : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${glassStyles} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between p-6 border-b border-gray-100 ${className}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1">
            <Icon className="w-6 h-6 text-primary-500 icon-linear" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-os-obsidian">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-os-lg ${className}`}>
      {children}
    </div>
  );
};
