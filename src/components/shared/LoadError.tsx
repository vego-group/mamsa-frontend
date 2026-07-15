'use client';

/**
 * LoadError — the standard "initial fetch failed" card.
 *
 * Replaces the eternal-loading dead end when a page's first data fetch
 * rejects: clear message + a retry button, styled like the site's other
 * error cards (payment callback / payment page).
 */
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface LoadErrorProps {
  onRetry: () => void;
  /** Defaults to the shared "couldn't load data" copy. */
  message?: string;
}

export function LoadError({ onRetry, message }: LoadErrorProps) {
  const t = useTranslations('common');
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-brand-border bg-white p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-status-danger">
        <AlertCircle className="h-7 w-7" />
      </div>
      <p className="text-sm leading-relaxed text-brand-muted">{message ?? t('loadFailed')}</p>
      <Button onClick={onRetry}>{t('retry')}</Button>
    </div>
  );
}
