'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[110px] w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-brand-ink placeholder:text-brand-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
