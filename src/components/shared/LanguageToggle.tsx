'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Flips the site language (ar ⇄ en) by rewriting the locale cookie and
 * refreshing the router — every server & client component re-renders in the
 * new locale, and <html lang/dir> flips with it. No URL prefixes involved.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === 'ar' ? 'en' : 'ar';

  const toggle = () => {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-full border border-brand-border bg-white px-3 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60 disabled:opacity-60',
        className,
      )}
      aria-label={next === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}
      title={next === 'en' ? 'English' : 'العربية'}
    >
      <Globe className="h-4 w-4 text-brand-muted" />
      <span>{next === 'en' ? 'EN' : 'عربي'}</span>
    </button>
  );
}
