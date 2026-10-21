import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50 hover:bg-cyan-500 hover:shadow-cyan-500/25 border border-cyan-400/30',
        destructive:
          'bg-red-600/90 text-white shadow-lg shadow-red-950/50 hover:bg-red-500 hover:shadow-red-500/25 border border-red-500/30',
        outline:
          'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60 shadow-sm',
        ghost:
          'text-slate-300 hover:bg-slate-800/80 hover:text-white',
        link:
          'text-cyan-400 underline-offset-4 hover:underline',
        tactical:
          'bg-slate-900/90 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base font-semibold',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
