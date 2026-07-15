'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/client';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function ConfirmationPage() {
  const t = useTranslations('bookingConfirmation');
  const tc = useTranslations('common');
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Bumping this re-runs the fetch effect — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!bookingId) return;
    setLoadError(false);
    bookingsApi
      .getById(bookingId)
      .then(setBooking)
      .catch(() => setLoadError(true));
  }, [bookingId, attempt]);

  // The user only lands here AFTER a server-verified successful payment, so
  // a details-fetch failure must NEVER read like a failed payment — reassure
  // first, then offer retry / reservations.
  if (loadError && !booking) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="space-y-5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-status-success" />
          <div>
            <h1 className="text-2xl font-bold text-brand-ink">{t('paidTitle')}</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">{t('paidDetailsUnavailable')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setAttempt((a) => a + 1)}>
              {tc('retry')}
            </Button>
            <Button asChild className="flex-1">
              <Link href="/my-reservations">{t('myReservations')}</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!booking) return <div className="container mx-auto p-10">{tc('loading')}</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="space-y-6 p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-status-success" />
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">{t('title')}</h1>
          <p className="mt-2 text-sm text-brand-muted">{t('subtitle')}</p>
        </div>

        <div className="rounded-2xl bg-brand-cream/50 p-5 text-start">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <div className="text-brand-muted">{t('bookingCode')}</div>
              <div className="font-mono font-semibold">{booking.code}</div>
            </div>
            <div>
              <div className="text-brand-muted">{t('amountPaid')}</div>
              <div className="font-semibold">{formatSAR(booking.price.total)}</div>
            </div>
            <div>
              <div className="text-brand-muted">{t('checkIn')}</div>
              <div className="font-semibold">{formatDate(booking.checkInDate)}</div>
            </div>
            <div>
              <div className="text-brand-muted">{t('checkOut')}</div>
              <div className="font-semibold">{formatDate(booking.checkOutDate)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/my-reservations">{t('myReservations')}</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/my-reservations/${booking.id}`}>{t('viewDetails')}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
