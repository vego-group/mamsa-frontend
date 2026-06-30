'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarRange } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookingCard } from '@/components/features/booking/BookingCard';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/separator';
import type { Booking } from '@/types';

export default function MyReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.list().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  /**
   * تصنيف الحجوزات حسب 4 تبويبات (SRS FR-040):
   * - جديدة:   confirmed و تاريخ الدخول > 14 يوم
   * - نشطة:    confirmed و تاريخ الدخول <= 14 يوم (و > 0)
   * - منتهية:  completed
   * - ملغاة:   cancelled
   */
  const categorized = useMemo(() => {
    const now = Date.now();
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
    const upcoming: Booking[] = [];
    const active: Booking[] = [];
    const completed: Booking[] = [];
    const cancelled: Booking[] = [];

    for (const b of bookings) {
      if (b.status === 'cancelled') cancelled.push(b);
      else if (b.status === 'completed') completed.push(b);
      else {
        const diff = new Date(b.checkInDate).getTime() - now;
        if (diff > TWO_WEEKS) upcoming.push(b);
        else active.push(b);
      }
    }
    return { upcoming, active, completed, cancelled };
  }, [bookings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">حجوزاتي</h1>
        <p className="mt-1 text-sm text-brand-muted">تابع حجوزاتك الحالية والسابقة وأدِرها من مكان واحد.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">جديدة ({categorized.upcoming.length})</TabsTrigger>
          <TabsTrigger value="active">نشطة ({categorized.active.length})</TabsTrigger>
          <TabsTrigger value="completed">منتهية ({categorized.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">ملغاة ({categorized.cancelled.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="upcoming">
              <Section bookings={categorized.upcoming} tab="upcoming" empty="لا توجد حجوزات جديدة" />
            </TabsContent>
            <TabsContent value="active">
              <Section bookings={categorized.active} tab="active" empty="لا توجد حجوزات نشطة قريبًا" />
            </TabsContent>
            <TabsContent value="completed">
              <Section bookings={categorized.completed} tab="completed" empty="لا توجد حجوزات منتهية" />
            </TabsContent>
            <TabsContent value="cancelled">
              <Section bookings={categorized.cancelled} tab="cancelled" empty="لا توجد حجوزات ملغاة" />
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
}: {
  bookings: Booking[];
  tab: 'upcoming' | 'active' | 'completed' | 'cancelled';
  empty: string;
}) {
  if (bookings.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-border bg-white p-12 text-center">
        <CalendarRange className="h-10 w-10 text-brand-border" />
        <p className="text-sm text-brand-muted">{empty}</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/units">تصفّح الإقامات</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="mt-6 space-y-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} tabContext={tab} />
      ))}
    </div>
  );
}
