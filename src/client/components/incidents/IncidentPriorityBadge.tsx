import React from 'react';
import { getPriorityConfig } from '../../lib/utils';
import { Badge } from '../ui/badge';

interface IncidentPriorityBadgeProps {
  priority: string;
  className?: string;
}

export const IncidentPriorityBadge: React.FC<IncidentPriorityBadgeProps> = ({ priority, className }) => {
  const config = getPriorityConfig(priority);

  return (
    <Badge
      variant={
        priority === 'CRITICAL'
          ? 'destructive'
          : priority === 'HIGH'
          ? 'warning'
          : 'default'
      }
      className={`text-[10px] font-mono font-bold tracking-wider ${className || ''}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};
