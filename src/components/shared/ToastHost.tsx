'use client';

import { useEffect } from 'react';
import { useToastStore } from '@/stores/toast';

/** Renders the current global toast (if any) — mounted once in the root layout. */
export function ToastHost() {
  const { message, clear } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clear, 4000);
    return () => clearTimeout(timer);
  }, [message, clear]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        dir="auto"
        className="pointer-events-auto max-w-md rounded-xl bg-brand-ink px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
      >
        {message}
      </div>
    </div>
  );
}
