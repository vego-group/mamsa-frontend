'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CalendarRange } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookingCard } from '@/components/features/booking/BookingCard';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/client';
import { daysUntilCheckIn } from '@/lib/cancellation/engine';
import { LoadError } from '@/components/shared/LoadError';
import { Skeleton } from '@/components/ui/separator';
import type { Booking } from '@/types';

export default function MyReservationsPage() {
  const t = useTranslations('myReservations');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Bumping this re-runs the fetch effect — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    bookingsApi
      .list()
      .then(setBookings)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  // Swap the cancelled booking in place — the useMemo re-categorization moves
  // its card from "upcoming/active" to "cancelled" without a page reload.
  const handleCancelled = (updated: Booking) =>
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));

  /**
   * تصنيف الحجوزات حسب 4 تبويبات (SRS FR-040):
   * - جديدة:   confirmed و تاريخ الدخول > 14 يوم
   * - نشطة:    confirmed و تاريخ الدخول <= 14 يوم (و > 0)
   * - منتهية:  completed
   * - ملغاة:   cancelled
   */
  const categorized = useMemo(() => {
    const now = new Date();
    const upcoming: Booking[] = [];
    const active: Booking[] = [];
    const completed: Booking[] = [];
    const cancelled: Booking[] = [];

    for (const b of bookings) {
      if (b.status === 'cancelled') cancelled.push(b);
      else if (b.status === 'completed') completed.push(b);
      // Days until check-in come from the cancellation engine so the day
      // boundary is the property's (Asia/Riyadh), same as refund cutoffs.
      else if (daysUntilCheckIn(b.checkInDate, now) > 14) upcoming.push(b);
      else active.push(b);
    }
    return { upcoming, active, completed, cancelled };
  }, [bookings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('title')}</h1>
        <p className="mt-1 text-sm text-brand-muted">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{t('tabs.upcoming')} ({categorized.upcoming.length})</TabsTrigger>
          <TabsTrigger value="active">{t('tabs.active')} ({categorized.active.length})</TabsTrigger>
          <TabsTrigger value="completed">{t('tabs.completed')} ({categorized.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">{t('tabs.cancelled')} ({categorized.cancelled.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : loadError ? (
          <div className="mt-6">
            <LoadError onRetry={() => setAttempt((a) => a + 1)} />
          </div>
        ) : (
          <>
            <TabsContent value="upcoming">
              <Section bookings={categorized.upcoming} tab="upcoming" empty={t('empty.upcoming')} browse={t('browse')} onCancelled={handleCancelled} />
            </TabsContent>
            <TabsContent value="active">
              <Section bookings={categorized.active} tab="active" empty={t('empty.active')} browse={t('browse')} onCancelled={handleCancelled} />
            </TabsContent>
            <TabsContent value="completed">
              <Section bookings={categorized.completed} tab="completed" empty={t('empty.completed')} browse={t('browse')} onCancelled={handleCancelled} />
            </TabsContent>
            <TabsContent value="cancelled">
              <Section bookings={categorized.cancelled} tab="cancelled" empty={t('empty.cancelled')} browse={t('browse')} onCancelled={handleCancelled} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function Section({
  bookings,
  tab,
  empty,
  browse,
  onCancelled,
}: {
  bookings: Booking[];
  tab: 'upcoming' | 'active' | 'completed' | 'cancelled';
  empty: string;
  browse: string;
  onCancelled: (updated: Booking) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center">
        <CalendarRange className="h-10 w-10 text-brand-border" />
        <p className="text-sm text-brand-muted">{empty}</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/units">{browse}</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="mt-6 space-y-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} tabContext={tab} onCancelled={onCancelled} />
      ))}
    </div>
  );
}
