import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 bg-cyan-500 transition-all duration-300 rounded-full',
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';
