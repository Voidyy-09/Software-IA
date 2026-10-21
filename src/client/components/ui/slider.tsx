import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  onValueChange?: (value: number) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      onValueChange?.(val);
      onChange?.(e);
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
          className
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';
