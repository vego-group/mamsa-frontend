'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, CreditCard, Plus, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { accountApi } from '@/lib/api/client';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { SavedCard, Transaction } from '@/types';
import { cn } from '@/lib/utils/cn';

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([accountApi.getCards(), accountApi.getTransactions()])
      .then(([c, t]) => { setCards(c as SavedCard[]); setTxns(t as Transaction[]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto p-10">جاري التحميل...</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary">
        <ArrowRight className="h-4 w-4" /> العودة لإعدادات الحساب
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-brand-ink">طرق الدفع</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        {/* Transactions */}
        <Card className="space-y-4 p-6 md:order-2">
          <h2 className="font-semibold">سجل المعاملات</h2>
          {txns.length === 0 ? (
            <p className="text-sm text-brand-muted">لا توجد معاملات بعد.</p>
          ) : (
            <ul className="space-y-3">
              {txns.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full',
                      t.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                    )}
                  >
                    {t.type === 'reward' ? <Gift className="h-4 w-4" /> : t.amount > 0 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-brand-ink">{t.description}</div>
                    <div className="font-mono text-[11px] text-brand-muted">{t.refCode}</div>
                  </div>
                  <div className="text-end">
                    <div className={cn('font-semibold', t.amount > 0 ? 'text-status-success' : 'text-status-danger')}>
                      {t.amount > 0 ? '+' : ''}{formatSAR(Math.abs(t.amount))}
                    </div>
                    <div className="text-[11px] text-brand-muted">{formatDate(t.date.slice(0, 10))}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Cards */}
        <Card className="space-y-4 p-6 md:order-1">
          <h2 className="font-semibold">البطاقات المحفوظة</h2>
          <div className="space-y-3">
            {cards.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-brand-border p-3"
              >
                <CreditCard className="h-6 w-6 text-brand-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {c.brand === 'visa' ? 'Visa' : c.brand === 'mastercard' ? 'Mastercard' : 'Mada'} •••• {c.last4}
                  </div>
                  <div className="text-xs text-brand-muted">
                    تنتهي في {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                  </div>
                </div>
                {c.isDefault && <Badge variant="sage">افتراضي</Badge>}
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-white p-3 text-sm text-brand-primary transition hover:bg-brand-cream/40">
              <Plus className="h-4 w-4" /> إضافة بطاقة جديدة
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
