import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary/10 text-brand-primary',
        sage: 'bg-brand-sage/30 text-brand-primary',
        warning: 'bg-yellow-100 text-yellow-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-700',
        outline: 'border border-brand-border bg-white text-brand-ink',
        cream: 'bg-brand-cream text-brand-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
