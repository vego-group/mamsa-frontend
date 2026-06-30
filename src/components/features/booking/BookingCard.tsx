'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, User, CalendarCheck, CalendarX, Users, Ticket, type LucideIcon } from 'lucide-react';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatSAR, diffNights } from '@/lib/utils/format';
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
  const nights = diffNights(booking.checkInDate, booking.checkOutDate);
  const guests = booking.guests.adults + booking.guests.children;

  const statusBadge = () => {
    if (tabContext === 'cancelled') return <Badge variant="danger">ملغي</Badge>;
    if (tabContext === 'completed') return <Badge variant="sage">مكتمل</Badge>;
    if (tabContext === 'active') return <Badge variant="success">مؤكد</Badge>;
    return <Badge variant="warning">في انتظار التأكيد</Badge>;
  };

  return (
    <>
      <Card className="overflow-hidden p-0 transition hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          {/* image (right side in RTL) */}
          {booking.unitSnapshot.imageUrl && (
            <img
              src={booking.unitSnapshot.imageUrl}
              alt={booking.unitSnapshot.title}
              className="h-44 w-full shrink-0 object-cover sm:h-auto sm:w-56"
            />
          )}

          <div className="flex flex-1 flex-col p-5">
            {/* header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-brand-ink">{booking.unitSnapshot.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-brand-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {booking.unitSnapshot.city}، {booking.unitSnapshot.country}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  المضيف: {booking.unitSnapshot.ownerName}
                </p>
              </div>
              {statusBadge()}
            </div>

            {/* details */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-brand-cream/40 p-3 sm:grid-cols-4">
              <Info icon={CalendarCheck} label="الوصول" value={formatDate(booking.checkInDate)} />
              <Info icon={CalendarX} label="المغادرة" value={formatDate(booking.checkOutDate)} />
              <Info icon={Users} label="الضيوف" value={`${guests} · ${nights} ليالٍ`} />
              <Info icon={Ticket} label="رمز التأكيد" value={booking.code} mono />
            </div>

            {/* footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
              <div>
                <div className="text-xs text-brand-muted">الإجمالي</div>
                <div className="text-xl font-bold text-brand-ink">{formatSAR(booking.price.total)}</div>
              </div>
              <div className="flex gap-2">
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
        </div>

        {/* Cancellation refund details (only for cancelled tab) */}
        {booking.status === 'cancelled' && booking.refund && (
          <div className="border-t border-brand-border bg-red-50/50 px-5 py-3 text-xs text-status-danger">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>تم الإلغاء بواسطة: {booking.refund.cancelledBy === 'customer' ? 'العميل' : 'النظام'}</span>
              {booking.refund.reason && <span>· السبب: {booking.refund.reason}</span>}
              <span>· المبلغ المسترد: {formatSAR(booking.refund.amount)} ({booking.refund.percent}%)</span>
            </div>
          </div>
        )}
      </Card>

      <CancelBookingDialog booking={booking} open={cancelOpen} onClose={() => setCancelOpen(false)} />
    </>
  );
}

function Info({ icon: Icon, label, value, mono }: { icon: LucideIcon; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
      <div className="min-w-0">
        <div className="text-[11px] text-brand-muted">{label}</div>
        <div className={`truncate text-xs font-semibold text-brand-ink${mono ? ' font-mono' : ''}`}>{value}</div>
      </div>
    </div>
  );
}
