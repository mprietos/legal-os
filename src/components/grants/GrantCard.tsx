import React from 'react';
import { TrendingUp, Clock, Calendar, ExternalLink, FileText } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge, GrantStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Grant {
  id: string;
  title: string;
  description: string;
  max_amount?: number;
  application_deadline?: string;
}

interface GrantCardProps {
  grant: Grant;
  matchScore: number;
  status: 'opportunity' | 'in_progress' | 'submitted' | 'rejected' | 'approved';
  onApply?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const GrantCard: React.FC<GrantCardProps> = ({
  grant,
  matchScore,
  status,
  onApply,
  onViewDetails,
  className = '',
}) => {
  const isPastDeadline = grant.application_deadline
    ? new Date(grant.application_deadline) < new Date()
    : false;

  const daysUntilDeadline = grant.application_deadline
    ? Math.ceil((new Date(grant.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0;

  return (
    <Card
      hover
      className={`${className} ${isUrgent ? 'ring-2 ring-compliance-warning-border' : ''}`}
    >
      <CardBody className="space-y-4">
        {/* Header with match score and status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-os-obsidian text-lg mb-1 line-clamp-2">
              {grant.title}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Match Score Badge */}
            <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-primary-700">
                {matchScore}% match
              </span>
            </div>

            {/* Status Badge */}
            <GrantStatusBadge status={status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {grant.description}
        </p>

        {/* Grant Details */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {/* Amount */}
          {grant.max_amount && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-compliance-success-text icon-linear" />
              <span className="text-sm font-semibold text-os-obsidian">
                Hasta {grant.max_amount.toLocaleString('es-ES')} €
              </span>
            </div>
          )}

          {/* Deadline */}
          {grant.application_deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 icon-linear" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-600">
                  Plazo: {new Date(grant.application_deadline).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                {isUrgent && !isPastDeadline && (
                  <Badge variant="warning" size="sm">
                    <Clock className="w-3 h-3 mr-1 icon-linear" />
                    {daysUntilDeadline} {daysUntilDeadline === 1 ? 'día' : 'días'}
                  </Badge>
                )}
                {isPastDeadline && (
                  <Badge variant="critical" size="sm">
                    Expirado
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar based on match score */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Probabilidad de éxito</span>
            <span className="font-semibold">{matchScore}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                matchScore >= 70
                  ? 'bg-compliance-success-text'
                  : matchScore >= 50
                  ? 'bg-compliance-warning-text'
                  : 'bg-compliance-info-text'
              }`}
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onApply && !isPastDeadline && status === 'opportunity' && (
            <Button
              variant="primary"
              size="md"
              icon={FileText}
              onClick={onApply}
              className="flex-1"
            >
              Generar solicitud
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="md"
              icon={ExternalLink}
              iconPosition="right"
              onClick={onViewDetails}
            >
              Ver detalles
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Simplified version for list views
interface GrantCardCompactProps {
  grant: Grant;
  matchScore: number;
  status: 'opportunity' | 'in_progress' | 'submitted' | 'rejected' | 'approved';
  onClick?: () => void;
}

export const GrantCardCompact: React.FC<GrantCardCompactProps> = ({
  grant,
  matchScore,
  status,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-gray-200 rounded-os-lg p-4 hover:border-primary-500 hover:shadow-os-md transition-all duration-300 bg-white"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-os-obsidian mb-1 line-clamp-1">
            {grant.title}
          </h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {grant.max_amount && (
              <span className="font-medium text-compliance-success-text">
                {grant.max_amount.toLocaleString('es-ES')} €
              </span>
            )}
            {grant.application_deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 icon-linear" />
                {new Date(grant.application_deadline).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-bold text-primary-600">
            {matchScore}%
          </div>
          <GrantStatusBadge status={status} />
        </div>
      </div>
    </button>
  );
};
