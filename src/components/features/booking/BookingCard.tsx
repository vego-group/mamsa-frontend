'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatSAR } from '@/lib/utils/format';
import { CancelBookingDialog } from './CancelBookingDialog';
import { isBookingCancellable } from '@/lib/cancellation/engine';

interface BookingCardProps {
  booking: Booking;
  /** which tab this card is displayed within — controls available actions */
  tabContext: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export function BookingCard({ booking, tabContext }: BookingCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const canCancel = isBookingCancellable(booking, new Date());

  const statusBadge = () => {
    if (tabContext === 'cancelled') return <Badge variant="danger">ملغي</Badge>;
    if (tabContext === 'completed') return <Badge variant="sage">مكتمل</Badge>;
    if (tabContext === 'active') return <Badge variant="success">مؤكد</Badge>;
    return <Badge variant="warning">في انتظار التأكيد</Badge>;
  };

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-5 md:flex-row-reverse md:items-stretch">
          {/* image on the visual left in RTL */}
          {booking.unitSnapshot.imageUrl && (
            <img
              src={booking.unitSnapshot.imageUrl}
              alt={booking.unitSnapshot.title}
              className="h-32 w-full rounded-xl object-cover md:h-32 md:w-44"
            />
          )}

          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-brand-ink">{booking.unitSnapshot.title}</h3>
                {statusBadge()}
              </div>
              <p className="text-xs text-brand-muted">
                {booking.unitSnapshot.city}، {booking.unitSnapshot.country}
              </p>
              <p className="text-xs text-brand-muted">
                المضيف: {booking.unitSnapshot.ownerName}
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2 text-xs">
                <div>
                  <div className="text-brand-muted">تسجيل الوصول</div>
                  <div className="font-medium">{formatDate(booking.checkInDate)}</div>
                </div>
                <div>
                  <div className="text-brand-muted">تسجيل المغادرة</div>
                  <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
                </div>
                <div>
                  <div className="text-brand-muted">الضيوف</div>
                  <div className="font-medium">{booking.guests.adults + booking.guests.children} ضيوف</div>
                </div>
                <div>
                  <div className="text-brand-muted">رمز التأكيد</div>
                  <div className="font-mono text-[11px] font-medium">{booking.code}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-2 border-t border-dashed border-brand-border pt-4 md:border-r md:border-t-0 md:pl-5 md:pr-5 md:pt-0 md:[border-top:none] md:[border-right:1px_dashed_var(--tw-border-opacity)]">
            <div className="text-end">
              <div className="text-2xl font-bold text-brand-ink">{formatSAR(booking.price.total)}</div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <Button asChild size="sm" variant="default">
                <Link href={`/my-reservations/${booking.id}`}>عرض التفاصيل</Link>
              </Button>

              {tabContext === 'upcoming' || tabContext === 'active' ? (
                canCancel && (
                  <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)}>
                    إلغاء الحجز
                  </Button>
                )
              ) : tabContext === 'completed' ? (
                <Button size="sm" variant="sage" asChild>
                  <Link href={`/units/${booking.unitId}`}>احجز مرة أخرى</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Cancellation refund details (only for cancelled tab) */}
        {booking.status === 'cancelled' && booking.refund && (
          <div className="border-t border-brand-border bg-red-50/40 px-5 py-3 text-xs">
            <div className="flex flex-col gap-1 text-status-danger">
              <span>تم الإلغاء بواسطة: {booking.refund.cancelledBy === 'customer' ? 'العميل' : 'النظام'}</span>
              {booking.refund.reason && <span>السبب: {booking.refund.reason}</span>}
              <span>المبلغ المسترد: {formatSAR(booking.refund.amount)} ({booking.refund.percent}%)</span>
            </div>
          </div>
        )}
      </Card>

      <CancelBookingDialog booking={booking} open={cancelOpen} onClose={() => setCancelOpen(false)} />
    </>
  );
}
