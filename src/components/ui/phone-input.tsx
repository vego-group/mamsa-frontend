'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export const PhoneInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let digits = event.target.value.replace(/\D/g, '');

      if (digits.startsWith('05') && digits.length > 1) {
        digits = digits.slice(1);
      }

      if (digits.startsWith('966') && digits.length > 3) {
        digits = digits.slice(3);
      }

      digits = digits.slice(0, 9);

      if (digits !== event.target.value) {
        event.target.value = digits;
      }

      onChange?.(event);
    };

    return (
      <div
        dir="ltr"
        className="flex flex-row items-stretch overflow-hidden rounded-xl border border-brand-border bg-white focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20"
      >
        <span className="flex items-center gap-1.5 border-e border-brand-border bg-brand-cream/60 px-3 text-sm text-brand-ink">
          <span aria-hidden>🇸🇦</span>
          <span>+966</span>
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          maxLength={9}
          className={cn(
            'h-11 w-full bg-transparent px-4 text-start text-brand-ink placeholder:text-brand-muted focus:outline-none',
            className,
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
