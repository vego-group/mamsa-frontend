'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bookingsApi } from '@/lib/api/client';
import { formatDate, formatSAR } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bookingId) bookingsApi.getById(bookingId).then(setBooking);
  }, [bookingId]);

  if (!booking) return <div className="container mx-auto p-10">جاري التحميل...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="space-y-6 p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-status-success" />
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">تم تأكيد حجزك!</h1>
          <p className="mt-2 text-sm text-brand-muted">
            شكرًا لاختيارك مَمسَى. تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني.
          </p>
        </div>

        <div className="rounded-2xl bg-brand-cream/50 p-5 text-start">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <div className="text-brand-muted">رقم الحجز</div>
              <div className="font-mono font-semibold">{booking.code}</div>
            </div>
            <div>
              <div className="text-brand-muted">المبلغ المدفوع</div>
              <div className="font-semibold">{formatSAR(booking.price.total)}</div>
            </div>
            <div>
              <div className="text-brand-muted">تسجيل الوصول</div>
              <div className="font-semibold">{formatDate(booking.checkInDate)}</div>
            </div>
            <div>
              <div className="text-brand-muted">تسجيل المغادرة</div>
              <div className="font-semibold">{formatDate(booking.checkOutDate)}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/my-reservations">حجوزاتي</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/my-reservations/${booking.id}`}>عرض التفاصيل</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
