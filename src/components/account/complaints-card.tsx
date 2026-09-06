'use client';

/**
 * The guest's complaints, one line each, on the account page. Empty is the
 * normal case here and reads as such — no warning tone, no call to action.
 * Each row leads to the booking, where the complaint itself lives.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/separator';
import { ComplaintStatusBadge } from '@/components/features/complaints/ComplaintStatusBadge';
import { complaintsApi } from '@/lib/api/client';
import { formatDateRiyadh } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { GuestComplaintRow } from '@/types';

type Load = 'loading' | 'ready' | 'error';

export function ComplaintsCard({ className }: { className?: string }) {
  const t = useTranslations('complaints');
  const tc = useTranslations('common');
  const [rows, setRows] = useState<GuestComplaintRow[]>([]);
  const [load, setLoad] = useState<Load>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoad('loading');
    complaintsApi
      .list()
      .then((r) => {
        if (cancelled) return;
        setRows(r);
        setLoad('ready');
      })
      .catch(() => !cancelled && setLoad('error'));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <Card className={cn('space-y-4 p-6', className)}>
      <div className="flex items-center gap-3">
        <Flag className="h-5 w-5 text-brand-primary" />
        <div>
          <h2 className="font-bold text-brand-ink">{t('list.title')}</h2>
          <p className="text-xs text-brand-muted">{t('list.subtitle')}</p>
        </div>
      </div>

      {load === 'loading' && (
        <div className="space-y-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      )}

      {load === 'error' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 p-3 text-sm text-status-danger">
          <span>{t('loadFailed')}</span>
          <Button size="sm" variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            {tc('retry')}
          </Button>
        </div>
      )}

      {load === 'ready' && rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-border p-4 text-center text-sm text-brand-muted">
          {t('list.empty')}
        </p>
      )}

      {load === 'ready' && rows.length > 0 && (
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/my-reservations/${row.bookingId}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-brand-cream/30"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-brand-ink">
                    {row.bookingCode
                      ? t('list.booking', { code: row.bookingCode })
                      : t('list.bookingById', { id: row.bookingId })}
                  </div>
                  {row.createdAt && (
                    <div className="text-xs text-brand-muted">
                      {t('submittedOn')}: {formatDateRiyadh(row.createdAt)}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ComplaintStatusBadge status={row.status} />
                  <ChevronLeft className="h-4 w-4 text-brand-muted ltr:rotate-180 rtl:rotate-0" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
