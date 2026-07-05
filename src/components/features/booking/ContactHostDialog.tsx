'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, Check, MessageCircle } from 'lucide-react';

export function ContactHostDialog({
  open,
  onClose,
  hostName,
}: {
  open: boolean;
  onClose: () => void;
  hostName: string;
}) {
  const t = useTranslations('contactHost');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const QUICK_MESSAGES = [t('quick.available'), t('quick.checkin'), t('quick.parking')];

  if (!open) return null;

  const close = () => {
    setMessage('');
    setSent(false);
    onClose();
  };

  const send = () => {
    if (!message.trim()) return;
    setSent(true);
  };

  const initial = hostName.trim().charAt(0) || '؟';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
              {initial}
            </div>
            <div>
              <div className="font-bold text-brand-ink">{hostName}</div>
              <div className="text-xs text-brand-muted">{t('hostRespondsIn')}</div>
            </div>
          </div>
          <button
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-status-success">
              <Check className="h-6 w-6" />
            </div>
            <div className="font-bold text-brand-ink">{t('sentTitle')}</div>
            <p className="text-sm text-brand-muted">{t('sentBody', { hostName })}</p>
            <button
              onClick={close}
              className="mt-2 rounded-full bg-brand-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-brand-primaryDark"
            >
              {t('done')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_MESSAGES.map((q) => (
                <button
                  key={q}
                  onClick={() => setMessage(q)}
                  className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-ink transition hover:border-brand-primary hover:bg-brand-cream/40"
                >
                  {q}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t('placeholder')}
              className="w-full resize-none rounded-xl border border-brand-border bg-white p-3 text-sm text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />

            <button
              onClick={send}
              disabled={!message.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary py-2.5 text-sm font-medium text-white transition hover:bg-brand-primaryDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {t('sendMessage')}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-brand-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              {t('secureNote')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
