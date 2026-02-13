import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export type AlertType = 'critical' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const alertConfig = {
  critical: {
    bg: 'bg-compliance-critical-bg',
    border: 'border-compliance-critical-border',
    text: 'text-compliance-critical-text',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-compliance-warning-bg',
    border: 'border-compliance-warning-border',
    text: 'text-compliance-warning-text',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-compliance-success-bg',
    border: 'border-compliance-success-border',
    text: 'text-compliance-success-text',
    icon: CheckCircle,
  },
  info: {
    bg: 'bg-compliance-info-bg',
    border: 'border-compliance-info-border',
    text: 'text-compliance-info-text',
    icon: Info,
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-l-4 rounded-os p-4 flex items-start gap-3 animate-slide-up ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5 icon-linear`} />

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold ${config.text} mb-1`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${config.text}`}>
          {message}
        </p>

        {action && (
          <button
            onClick={action.onClick}
            className={`mt-2 text-sm font-medium ${config.text} underline hover:no-underline transition-all`}
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Cerrar alerta"
        >
          <X className="w-5 h-5 icon-linear" />
        </button>
      )}
    </div>
  );
};
