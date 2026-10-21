import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
        secondary:
          'border border-slate-700 bg-slate-800 text-slate-300',
        destructive:
          'border border-red-500/30 bg-red-500/15 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.25)]',
        warning:
          'border border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        success:
          'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
        outline:
          'border border-slate-600 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
