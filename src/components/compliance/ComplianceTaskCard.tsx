import React from 'react';
import { AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { ComplianceStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceTaskCardProps {
  id: string;
  requirement: ComplianceRequirement;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  onViewDetails?: () => void;
  className?: string;
}

export const ComplianceTaskCard: React.FC<ComplianceTaskCardProps> = ({
  id,
  requirement,
  status,
  dueDate,
  onViewDetails,
  className = '',
}) => {
  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertCircle className="w-5 h-5 text-compliance-critical-text icon-linear" />;
    }
    return <Clock className="w-5 h-5 text-compliance-warning-text icon-linear" />;
  };

  const getSeverityBorder = (severity: string) => {
    if (severity === 'critical') return 'border-l-4 border-compliance-critical-text';
    if (severity === 'high') return 'border-l-4 border-compliance-warning-text';
    return 'border-l-4 border-compliance-info-text';
  };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
  const daysUntilDue = dueDate
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card
      hover
      className={`${className} ${getSeverityBorder(requirement.severity)}`}
    >
      <CardBody className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getSeverityIcon(requirement.severity)}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-os-obsidian mb-1 line-clamp-2">
                {requirement.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {requirement.description}
              </p>
            </div>
          </div>

          <ComplianceStatusBadge status={status} />
        </div>

        {/* Due Date */}
        {dueDate && (
          <div
            className={`flex items-center gap-2 text-sm ${
              isOverdue
                ? 'text-compliance-critical-text'
                : daysUntilDue && daysUntilDue <= 7
                ? 'text-compliance-warning-text'
                : 'text-gray-500'
            }`}
          >
            <Clock className="w-4 h-4 icon-linear" />
            <span>
              {isOverdue ? (
                <span className="font-semibold">Vencido el </span>
              ) : (
                'Vencimiento: '
              )}
              {new Date(dueDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7 && (
              <span className="ml-auto font-semibold">
                ({daysUntilDue} {daysUntilDue === 1 ? 'día' : 'días'})
              </span>
            )}
          </div>
        )}

        {/* Action */}
        {onViewDetails && (
          <div className="pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={onViewDetails}
              fullWidth
            >
              Ver detalles y resolver
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Empty state for when there are no compliance tasks
export const ComplianceTasksEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-compliance-success-text" />
      <h3 className="text-lg font-semibold text-os-obsidian mb-2">
        ¡Todo en orden!
      </h3>
      <p className="text-gray-600">
        No hay tareas de cumplimiento pendientes en este momento.
      </p>
    </div>
  );
};
