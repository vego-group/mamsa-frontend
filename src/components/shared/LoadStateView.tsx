'use client';

/**
 * The card a protected page shows when its first fetch did not return data.
 *
 * Every branch here ends somewhere the visitor can act: the 401 asks for the
 * sign-in the page actually needs, 403/404 say plainly what happened, and a
 * genuine fault keeps the retry button. Nothing falls back to an endless
 * «جاري التحميل…».
 *
 * The sign-in prompt deliberately does NOT navigate: the site has no /login
 * route (auth is a dialog), and staying on this URL is what makes the person
 * land back on the page they asked for the moment they finish. The caller
 * re-runs its fetch off `isAuthenticated`.
 */
import { useEffect, useRef } from 'react';
import { AlertCircle, LogIn, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadError } from '@/components/shared/LoadError';
import { useUiStore } from '@/stores/ui';
import type { LoadFailure } from '@/lib/api/load-state';

interface LoadStateViewProps {
  state: LoadFailure;
  /** Re-runs the page's fetch — used by the retry button on a real fault. */
  onRetry: () => void;
  /** Page-specific copy; each falls back to the shared wording. */
  forbiddenMessage?: string;
  notFoundMessage?: string;
  errorMessage?: string;
}

export function LoadStateView({
  state,
  onRetry,
  forbiddenMessage,
  notFoundMessage,
  errorMessage,
}: LoadStateViewProps) {
  const t = useTranslations('common');
  const openAuth = useUiStore((s) => s.openAuth);
  // Open the dialog once on arrival — the common case is a link opened from an
  // email in a browser where nobody is signed in, and making that person hunt
  // for a button first is a step with no purpose. Reopening on every render
  // would trap them, so this fires exactly once per mount.
  const prompted = useRef(false);

  useEffect(() => {
    if (state !== 'unauthenticated' || prompted.current) return;
    prompted.current = true;
    openAuth('login');
  }, [state, openAuth]);

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-md">
        <LoadError message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return (
      <StateCard
        icon={<LogIn className="h-7 w-7" />}
        tone="brand"
        title={t('signInRequiredTitle')}
        body={t('signInRequiredBody')}
        action={<Button onClick={() => openAuth('login')}>{t('signIn')}</Button>}
      />
    );
  }

  return (
    <StateCard
      icon={state === 'forbidden' ? <AlertCircle className="h-7 w-7" /> : <SearchX className="h-7 w-7" />}
      tone="muted"
      title={state === 'forbidden' ? t('forbiddenTitle') : t('notFoundTitle')}
      body={
        state === 'forbidden'
          ? forbiddenMessage ?? t('forbiddenBody')
          : notFoundMessage ?? t('notFoundBody')
      }
    />
  );
}

function StateCard({
  icon,
  tone,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  tone: 'brand' | 'muted';
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          tone === 'brand' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface text-brand-muted'
        }`}
      >
        {icon}
      </div>
      <h2 className="text-lg font-bold text-brand-ink">{title}</h2>
      <p className="text-sm leading-relaxed text-brand-muted">{body}</p>
      {action}
    </Card>
  );
}
