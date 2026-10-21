import React from 'react';
import { Progress } from '../ui/progress';

interface CapacityProgressProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  colorClass?: string;
}

export const CapacityProgress: React.FC<CapacityProgressProps> = ({
  label,
  value,
  max = 100,
  unit = '%',
  colorClass = 'bg-cyan-500',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-200">
          {value}
          {unit}
        </span>
      </div>
      <Progress value={percentage} indicatorClassName={colorClass} className="h-1.5" />
    </div>
  );
};
