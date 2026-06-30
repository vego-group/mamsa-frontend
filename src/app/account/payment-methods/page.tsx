'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, ArrowDownLeft, Plus, Gift, Wifi, Trash2, X } from 'lucide-react';
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

const TXN_LABEL: Record<TransactionType, string> = {
  payment: 'دفع',
  refund: 'استرداد',
  topup: 'إضافة رصيد',
  reward: 'مكافأة',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmCard, setConfirmCard] = useState<SavedCard | null>(null);

  useEffect(() => {
    Promise.all([accountApi.getCards(), accountApi.getTransactions()])
      .then(([c, t]) => { setCards(c as SavedCard[]); setTxns(t as Transaction[]); })
      .finally(() => setLoading(false));
  }, []);

  const deleteCard = (id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      // Promote a new default if we removed the default card.
      if (next.length && !next.some((c) => c.isDefault)) next[0] = { ...next[0]!, isDefault: true };
      return next;
    });
  };

  const setDefaultCard = (id: string) =>
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));

  const addCard = (card: Omit<SavedCard, 'id' | 'isDefault'>) => {
    setCards((prev) => [
      ...prev,
      { ...card, id: crypto.randomUUID(), isDefault: prev.length === 0 },
    ]);
    setShowAdd(false);
  };

  if (loading) return <div className="container mx-auto p-10 text-center text-brand-muted">جاري التحميل...</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted transition hover:text-brand-primary">
        <ArrowRight className="h-4 w-4" /> العودة لإعدادات الحساب
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">طرق الدفع</h1>
        <p className="mt-1 text-sm text-brand-muted">أدِر بطاقاتك المحفوظة واطّلع على سجل معاملاتك المالية.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        {/* Cards */}
        <section className="space-y-4">
          <h2 className="font-bold text-brand-ink">البطاقات المحفوظة</h2>
          <div className="space-y-4">
            {cards.length === 0 && (
              <p className="rounded-2xl border border-dashed border-brand-border bg-white p-6 text-center text-sm text-brand-muted">
                لا توجد بطاقات محفوظة بعد.
              </p>
            )}

            {cards.map((c) => (
              <div key={c.id} className="space-y-2">
                <CreditCardVisual card={c} />
                <div className="flex items-center justify-between px-1 text-xs">
                  {c.isDefault ? (
                    <span className="font-medium text-brand-muted">البطاقة الافتراضية</span>
                  ) : (
                    <button onClick={() => setDefaultCard(c.id)} className="font-medium text-brand-primary hover:underline">
                      تعيين كافتراضية
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmCard(c)}
                    className="inline-flex items-center gap-1 font-medium text-status-danger transition hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> حذف
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAdd(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border bg-white p-4 text-sm font-medium text-brand-primary transition hover:border-brand-primary hover:bg-brand-cream/40"
            >
              <Plus className="h-4 w-4" /> إضافة بطاقة جديدة
            </button>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-brand-cream/50 p-3 text-xs leading-relaxed text-brand-muted">
            <span className="mt-0.5">🔒</span>
            بياناتك محمية ومشفّرة. لا نقوم بتخزين رقم بطاقتك الكامل.
          </p>
        </section>

        {/* Transactions */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-ink">سجل المعاملات</h2>
            <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-muted">
              {txns.length} معاملة
            </span>
          </div>

          {txns.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-muted">لا توجد معاملات بعد.</p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {txns.map((t) => {
                const incoming = t.amount > 0;
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3.5">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        t.type === 'reward'
                          ? 'bg-amber-100 text-amber-600'
                          : incoming
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      {t.type === 'reward' ? <Gift className="h-5 w-5" /> : incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-brand-ink">{t.description}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-brand-muted">
                        <span className="rounded bg-brand-cream px-1.5 py-0.5">{TXN_LABEL[t.type]}</span>
                        <span className="font-mono">{t.refCode}</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className={cn('font-bold tabular-nums', incoming ? 'text-status-success' : 'text-status-danger')}>
                        {incoming ? '+' : '−'}{formatSAR(Math.abs(t.amount))}
                      </div>
                      <div className="text-[11px] text-brand-muted">{formatDate(t.date.slice(0, 10))}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={addCard} />}

      {confirmCard && (
        <ConfirmDeleteModal
          card={confirmCard}
          onClose={() => setConfirmCard(null)}
          onConfirm={() => { deleteCard(confirmCard.id); setConfirmCard(null); }}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({
  card,
  onClose,
  onConfirm,
}: {
  card: SavedCard;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-status-danger">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brand-ink">حذف البطاقة</h2>
          <p className="mt-1 text-sm text-brand-muted">
            هل أنت متأكد من حذف بطاقة {BRAND_NAME[card.brand]} المنتهية بـ <span className="font-mono font-semibold">{card.last4}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-status-danger py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            نعم، احذف
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-brand-border py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function CreditCardVisual({ card }: { card: SavedCard }) {
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
            افتراضية
          </span>
        )}
      </div>

      <div className="relative mt-5 font-mono text-lg tracking-widest">
        •••• •••• •••• {card.last4}
      </div>

      <div className="relative mt-4 flex items-end justify-between">
        <div className="text-[11px]">
          <div className="opacity-70">تنتهي في</div>
          <div className="font-medium tabular-nums">
            {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
          </div>
        </div>
        <div className="text-lg font-bold italic tracking-tight">{BRAND_NAME[card.brand]}</div>
      </div>
    </div>
  );
}

function AddCardModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (card: Omit<SavedCard, 'id' | 'isDefault'>) => void;
}) {
  const [brand, setBrand] = useState<SavedCard['brand']>('visa');
  const [number, setNumber] = useState('');
  const [expMonth, setExpMonth] = useState<number>(1);
  const [expYear, setExpYear] = useState<number>(CURRENT_YEAR);

  const digits = number.replace(/\D/g, '');
  const valid = digits.length >= 4;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onAdd({ brand, last4: digits.slice(-4), expMonth, expYear });
  };

  // Format number with spaces every 4 digits for display.
  const formatted = digits.replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-ink">إضافة بطاقة جديدة</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">نوع البطاقة</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as SavedCard['brand'])}
            className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="mada">mada</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-ink">رقم البطاقة</label>
          <input
            value={formatted}
            onChange={(e) => setNumber(e.target.value)}
            inputMode="numeric"
            maxLength={19}
            placeholder="0000 0000 0000 0000"
            className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 font-mono text-sm tracking-widest focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-ink">شهر الانتهاء</label>
            <select
              value={expMonth}
              onChange={(e) => setExpMonth(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-ink">سنة الانتهاء</label>
            <select
              value={expYear}
              onChange={(e) => setExpYear(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid}
            className="flex-1 rounded-full bg-brand-primary py-2.5 text-sm font-medium text-white transition hover:bg-brand-primaryDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            حفظ البطاقة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
