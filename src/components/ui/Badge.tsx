import React from 'react';

export type BadgeVariant = 'critical' | 'warning' | 'success' | 'info' | 'neutral' | 'grant';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  pill?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-compliance-critical-bg text-compliance-critical-text border-compliance-critical-border',
  warning: 'bg-compliance-warning-bg text-compliance-warning-text border-compliance-warning-border',
  success: 'bg-compliance-success-bg text-compliance-success-text border-compliance-success-border',
  info: 'bg-compliance-info-bg text-compliance-info-text border-compliance-info-border',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  grant: 'bg-primary-50 text-primary-700 border-primary-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  pill = true,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium border transition-all duration-200';
  const shapeStyles = pill ? 'rounded-full' : 'rounded-os';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`}
    >
      {children}
    </span>
  );
};

// Status Badges específicos para el dominio
export interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  size?: BadgeSize;
}

export const ComplianceStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: { label: 'Pendiente', variant: 'critical' as BadgeVariant },
    in_progress: { label: 'En proceso', variant: 'warning' as BadgeVariant },
    completed: { label: 'Completado', variant: 'success' as BadgeVariant },
    rejected: { label: 'Rechazado', variant: 'neutral' as BadgeVariant },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export interface GrantStatusBadgeProps {
  status: 'opportunity' | 'in_progress' | 'submitted' | 'rejected' | 'approved';
  size?: BadgeSize;
}

export const GrantStatusBadge: React.FC<GrantStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const statusConfig = {
    opportunity: { label: 'Nueva', variant: 'grant' as BadgeVariant },
    in_progress: { label: 'En proceso', variant: 'warning' as BadgeVariant },
    submitted: { label: 'Presentada', variant: 'info' as BadgeVariant },
    rejected: { label: 'Rechazada', variant: 'neutral' as BadgeVariant },
    approved: { label: 'Aprobada', variant: 'success' as BadgeVariant },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};
