'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight, ArrowDownLeft, Gift, Wifi, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { accountApi } from '@/lib/api/client';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { SavedCard, Transaction, TransactionType } from '@/types';
import { cn } from '@/lib/utils/cn';

const BRAND_NAME: Record<SavedCard['brand'], string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  mada: 'mada',
};

export default function PaymentMethodsPage() {
  const t = useTranslations('paymentMethods');
  const tc = useTranslations('common');

  const TXN_LABEL: Record<TransactionType, string> = {
    payment: t('txnType.payment'),
    refund: t('txnType.refund'),
    topup: t('txnType.topup'),
    reward: t('txnType.reward'),
  };

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCard, setConfirmCard] = useState<SavedCard | null>(null);

  useEffect(() => {
    Promise.all([accountApi.getCards(), accountApi.getTransactions()])
      .then(([c, t]) => { setCards(c as SavedCard[]); setTxns(t as Transaction[]); })
      .finally(() => setLoading(false));
  }, []);

  const refreshCards = async () => {
    const c = await accountApi.getCards();
    setCards(c as SavedCard[]);
  };

  const deleteCard = async (id: string) => {
    await accountApi.deleteCard(id);
    await refreshCards();
  };

  const setDefaultCard = async (id: string) => {
    await accountApi.setDefaultCard(id);
    await refreshCards();
  };

  if (loading) return <div className="container mx-auto p-10 text-center text-brand-muted">{tc('loading')}</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted transition hover:text-brand-primary">
        <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" /> {t('backToSettings')}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('title')}</h1>
        <p className="mt-1 text-sm text-brand-muted">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        {/* Cards */}
        <section className="space-y-4">
          <h2 className="font-bold text-brand-ink">{t('savedCards')}</h2>
          <div className="space-y-4">
            {cards.length === 0 && (
              <p className="rounded-2xl border border-dashed border-brand-border bg-white p-6 text-center text-sm text-brand-muted">
                {t('noCards')}
              </p>
            )}

            {cards.map((c) => (
              <div key={c.id} className="space-y-2">
                <CreditCardVisual card={c} t={t} />
                <div className="flex items-center justify-between px-1 text-xs">
                  {c.isDefault ? (
                    <span className="font-medium text-brand-muted">{t('defaultCard')}</span>
                  ) : (
                    <button onClick={() => setDefaultCard(c.id)} className="font-medium text-brand-primary hover:underline">
                      {t('setAsDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmCard(c)}
                    className="inline-flex items-center gap-1 font-medium text-status-danger transition hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t('delete')}
                  </button>
                </div>
              </div>
            ))}

            {/* Cards are tokenised by the Moyasar hosted form during checkout
                ("save card" checkbox) — full card numbers never touch our pages. */}
            <p className="rounded-2xl border border-dashed border-brand-border bg-white p-4 text-center text-xs leading-relaxed text-brand-muted">
              {t('cardsSavedDuringPayment')}
            </p>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-brand-cream/50 p-3 text-xs leading-relaxed text-brand-muted">
            <span className="mt-0.5">🔒</span>
            {t('secureNote')}
          </p>
        </section>

        {/* Transactions */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">{t('transactionHistory')}</h2>
            <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-muted">
              {t('transactionCount', { count: txns.length })}
            </span>
          </div>

          {txns.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-muted">{t('noTransactions')}</p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {txns.map((tx) => {
                const incoming = tx.amount > 0;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-3.5">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        tx.type === 'reward'
                          ? 'bg-amber-100 text-amber-600'
                          : incoming
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      {tx.type === 'reward' ? <Gift className="h-5 w-5" /> : incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-brand-ink">{tx.description}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-brand-muted">
                        <span className="rounded bg-brand-cream px-1.5 py-0.5">{TXN_LABEL[tx.type]}</span>
                        <span className="font-mono">{tx.refCode}</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className={cn('font-bold tabular-nums', incoming ? 'text-status-success' : 'text-status-danger')}>
                        {incoming ? '+' : '−'}{formatSAR(Math.abs(tx.amount))}
                      </div>
                      <div className="text-[11px] text-brand-muted">{formatDate(tx.date.slice(0, 10))}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {confirmCard && (
        <ConfirmDeleteModal
          card={confirmCard}
          onClose={() => setConfirmCard(null)}
          onConfirm={async () => { await deleteCard(confirmCard.id); setConfirmCard(null); }}
          t={t}
        />
      )}
    </div>
  );
}

type T = ReturnType<typeof useTranslations>;

function ConfirmDeleteModal({
  card,
  onClose,
  onConfirm,
  t,
}: {
  card: SavedCard;
  onClose: () => void;
  onConfirm: () => void;
  t: T;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-status-danger">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-ink">{t('deleteCardTitle')}</h2>
          <p className="mt-1 text-sm text-brand-muted">
            {t('deleteCardConfirm', { brand: BRAND_NAME[card.brand], last4: card.last4 })}
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-status-danger py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            {t('yesDelete')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-brand-border py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreditCardVisual({ card, t }: { card: SavedCard; t: T }) {
  return (
    <div
      className={cn(
        'relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 text-white shadow-md',
        card.isDefault
          ? 'bg-gradient-to-br from-brand-primary to-brand-primaryDark'
          : 'bg-gradient-to-br from-[#2f3d35] to-brand-ink',
      )}
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="block h-7 w-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400/80" />
          <Wifi className="h-5 w-5 rotate-90 opacity-80" />
        </div>
        {card.isDefault && (
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            {t('defaultBadge')}
          </span>
        )}
      </div>

      <div className="relative mt-5 font-mono text-lg tracking-widest">
        •••• •••• •••• {card.last4}
      </div>

      <div className="relative mt-4 flex items-end justify-between">
        <div className="text-[11px]">
          <div className="opacity-70">{t('expiresOnLabel')}</div>
          <div className="font-medium tabular-nums">
            {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
          </div>
        </div>
        <div className="text-lg font-bold italic tracking-tight">{BRAND_NAME[card.brand]}</div>
      </div>
    </div>
  );
}

