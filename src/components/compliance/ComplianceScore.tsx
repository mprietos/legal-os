import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComplianceScoreProps {
  score: number;
  previousScore?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  showLabel?: boolean;
}

export const ComplianceScore: React.FC<ComplianceScoreProps> = ({
  score,
  previousScore,
  className = '',
  size = 'lg',
  showTrend = true,
  showLabel = true,
}) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-compliance-success-text';
    if (value >= 60) return 'text-compliance-warning-text';
    return 'text-compliance-critical-text';
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'bg-compliance-success-bg';
    if (value >= 60) return 'bg-compliance-warning-bg';
    return 'bg-compliance-critical-bg';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excelente';
    if (value >= 60) return 'Mejorable';
    return 'Requiere atención';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-compliance-success-text';
    if (value >= 60) return 'bg-compliance-warning-text';
    return 'bg-compliance-critical-text';
  };

  const getTrend = () => {
    if (!previousScore) return null;
    const diff = score - previousScore;

    if (diff > 0) {
      return {
        icon: TrendingUp,
        color: 'text-compliance-success-text',
        label: `+${diff.toFixed(1)}`,
      };
    } else if (diff < 0) {
      return {
        icon: TrendingDown,
        color: 'text-compliance-critical-text',
        label: `${diff.toFixed(1)}`,
      };
    }
    return {
      icon: Minus,
      color: 'text-gray-500',
      label: '0',
    };
  };

  const trend = getTrend();

  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      text: 'text-xl',
      subtext: 'text-[8px]',
    },
    md: {
      container: 'w-20 h-20',
      text: 'text-2xl',
      subtext: 'text-[10px]',
    },
    lg: {
      container: 'w-24 h-24',
      text: 'text-3xl',
      subtext: 'text-xs',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Score Circle */}
      <div className="relative">
        <div
          className={`flex items-center justify-center ${config.container} rounded-full ${getScoreBgColor(score)} transition-all duration-500 animate-scale-in`}
        >
          <div className="text-center">
            <div className={`font-bold ${getScoreColor(score)} ${config.text}`}>
              {score}
            </div>
            <div className={`${getScoreColor(score)} ${config.subtext}`}>/ 100</div>
          </div>
        </div>

        {/* Trend indicator */}
        {showTrend && trend && previousScore !== undefined && (
          <div
            className={`absolute -bottom-2 -right-2 ${trend.color} bg-white rounded-full p-1.5 shadow-os flex items-center gap-1 text-xs font-semibold`}
          >
            <trend.icon className="w-3 h-3" />
            <span className="text-[10px]">{trend.label}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(score)} transition-all duration-700 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>

        {showLabel && (
          <div className="flex items-center justify-between mt-2">
            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
            <span className="text-xs text-gray-500">
              {score}% compliant
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface ComplianceScoreCardProps {
  score: number;
  previousScore?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({
  score,
  previousScore,
  title = 'Compliance Score',
  subtitle = 'Estado de cumplimiento normativo de tu empresa',
  className = '',
}) => {
  return (
    <div className={`bento-card ${className}`}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-os-obsidian mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">
          {subtitle}
        </p>
      </div>

      <ComplianceScore
        score={score}
        previousScore={previousScore}
        showTrend={true}
        showLabel={true}
      />
    </div>
  );
};
