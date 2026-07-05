'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';

/**
 * Shows the backend's `debug_otp` for quick manual testing, with a one-click copy.
 * Renders nothing unless a code is supplied — the backend controls exposure by only
 * including `debug_otp` in non-production responses, and this build-env check is a
 * second line of defense in case that field ever leaks into a production response.
 */
export function DebugOtpHint({ code }: { code?: string }) {
  const t = useTranslations('auth.debugOtp');
  const [copied, setCopied] = useState(false);
  if (!code || process.env.NODE_ENV === 'production') return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — the code is still visible to copy manually.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mx-auto flex items-center gap-2 rounded-full border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 transition hover:bg-amber-100"
    >
      <span>{t('label')}</span>
      <span dir="ltr" className="font-mono font-bold">{code}</span>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
