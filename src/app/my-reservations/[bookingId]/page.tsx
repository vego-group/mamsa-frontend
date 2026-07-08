'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, CreditCard, MessageCircle, Download, X, ShieldCheck, MapPin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelBookingDialog } from '@/components/features/booking/CancelBookingDialog';
import { ContactHostDialog } from '@/components/features/booking/ContactHostDialog';
import { ReviewDialog } from '@/components/features/reviews/ReviewDialog';
import { bookingsApi, reviewsApi } from '@/lib/api/client';
import { formatDate, formatSAR } from '@/lib/utils/format';
import { downloadBookingConfirmation } from '@/lib/utils/booking-confirmation';
import { isBookingCancellable } from '@/lib/cancellation/engine';
import type { Booking, Review } from '@/types';

export default function BookingDetailsPage() {
  const t = useTranslations('bookingDetails');
  const tc = useTranslations('common');
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    bookingsApi.getById(bookingId).then(setBooking);
    reviewsApi.getForBooking(bookingId).then((r) => setReview(r));
  }, [bookingId]);

  if (!booking) return <div className="container mx-auto p-10">{tc('loading')}</div>;
  const canCancel = isBookingCancellable(booking, new Date());
  // Prefer the backend-embedded flag; `review` (mock-only endpoint) covers mock mode.
  const hasReview = booking.isReviewed || Boolean(review);

  const statusBadge =
    booking.status === 'cancelled' ? <Badge variant="danger">{t('status.cancelled')}</Badge>
    : booking.status === 'completed' ? <Badge variant="sage">{t('status.completed')}</Badge>
    : booking.status === 'confirmed' ? <Badge variant="success">{t('status.confirmed')}</Badge>
    : <Badge variant="warning">{t('status.pending')}</Badge>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/my-reservations" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary">
        <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" /> {t('backToReservations')}
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <div></div>
        {statusBadge}
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left summary */}
        <aside className="space-y-4">
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold text-brand-ink">{t('priceSummary')}</h2>
            <Row label={t('priceLine', { price: booking.price.pricePerNight, nights: booking.price.nights })} value={formatSAR(booking.price.subtotal)} />
            <Row label={t('serviceFee')} value={formatSAR(booking.price.serviceFee)} />
            <Row label={t('cleaningFee')} value={formatSAR(booking.price.cleaningFee)} />
            <Row label={t('taxes')} value={formatSAR(booking.price.tax)} />
            <hr className="border-brand-border" />
            <Row label={t('grandTotal')} value={formatSAR(booking.price.total)} bold />
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <div className="font-semibold">{t('securePaymentTitle')}</div>
                <div>{t('securePaymentBody')}</div>
              </div>
            </div>
          </Card>

          <Card className="space-y-2 p-3">
            <Button variant="outline" className="w-full" size="sm" onClick={() => setContactOpen(true)}>
              <MessageCircle className="h-4 w-4" /> {t('contactHost')}
            </Button>
            <Button variant="ghost" className="w-full" size="sm" onClick={() => downloadBookingConfirmation(booking)}>
              <Download className="h-4 w-4" /> {t('downloadConfirmation')}
            </Button>

            {booking.status === 'pending_payment' && (
              <Button asChild className="w-full" size="sm">
                <Link href={`/payment/${booking.id}`}>
                  <CreditCard className="h-4 w-4" /> {t('completePayment')}
                </Link>
              </Button>
            )}

            {/* Cancelling an unpaid pending booking frees its held dates. */}
            {(booking.status === 'confirmed' || booking.status === 'pending_payment') && canCancel && (
              <Button variant="danger" className="w-full" size="sm" onClick={() => setCancelOpen(true)}>
                <X className="h-4 w-4" /> {t('cancelBooking')}
              </Button>
            )}

            {booking.status === 'completed' && !hasReview && (
              <Button variant="sage" className="w-full" size="sm" onClick={() => setReviewOpen(true)}>
                <Star className="h-4 w-4" /> {t('writeReview')}
              </Button>
            )}
            {booking.status === 'completed' && hasReview && (
              <div className="rounded-xl bg-green-50 p-2 text-center text-xs text-green-800">✓ {t('reviewed')}</div>
            )}

            {(booking.status === 'completed' || booking.status === 'cancelled') && (
              <Button asChild variant="default" className="w-full" size="sm">
                <Link href={`/units/${booking.unitId}`}>{t('bookAgain')}</Link>
              </Button>
            )}
          </Card>
        </aside>

        {/* Right content */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl">
            <img src={booking.unitSnapshot.imageUrl} alt="" className="h-80 w-full object-cover" />
          </div>

          {booking.status === 'cancelled' && booking.refund && (
            <Card className="border-red-200 bg-red-50 p-5">
              <div className="mb-2 flex items-center gap-2 font-semibold text-status-danger">
                <X className="h-4 w-4" /> {t('cancelledBy')}: {booking.refund.cancelledBy === 'customer' ? t('byCustomer') : t('bySystem')}
              </div>
              <div className="space-y-1 text-sm text-red-900">
                {booking.refund.reason && <div>{t('reason')}: {booking.refund.reason}</div>}
                {booking.cancelledAt && <div>{t('cancelledAt')}: {formatDate(booking.cancelledAt.slice(0, 10))}</div>}
                <div>{t('refunded')}: {formatSAR(booking.refund.amount)} ({booking.refund.percent}%)</div>
              </div>
            </Card>
          )}

          <Card className="space-y-2 p-5">
            <h1 className="text-xl font-bold">{booking.unitSnapshot.title}</h1>
            <p className="flex items-center gap-1 text-sm text-brand-muted">
              <MapPin className="h-4 w-4" /> {booking.unitSnapshot.city}، {booking.unitSnapshot.country}
            </p>
            <p className="text-sm text-brand-muted">
              {t('guestsLine', { count: booking.guests.adults + booking.guests.children })}
            </p>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">{t('bookingDetailsTitle')}</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <Field label={t('checkInDate')} value={formatDate(booking.checkInDate)} sub={t('checkInTime')} />
              <Field label={t('checkOutDate')} value={formatDate(booking.checkOutDate)} sub={t('checkOutTime')} />
              <Field label={t('stayLength')} value={t('nightsCount', { count: booking.nights })} />
              <Field
                label={t('guests')}
                value={
                  t('adultsCount', { count: booking.guests.adults }) +
                  (booking.guests.children ? ` • ${t('childrenCount', { count: booking.guests.children })}` : '')
                }
              />
              <Field label={t('bookingNumber')} value={booking.id} mono />
              <Field label={t('confirmationCode')} value={booking.code} mono />
            </div>
          </Card>

          {booking.payment && (
            <Card className="space-y-2 p-5">
              <h2 className="font-semibold">{t('paymentMethod')}</h2>
              <div className="flex items-center gap-3 rounded-xl border border-brand-border p-3">
                <CreditCard className="h-6 w-6 text-brand-primary" />
                <div>
                  <div className="font-medium">
                    {booking.payment.method === 'mada' ? 'Mada' : 'Visa'} •••• {booking.payment.last4}
                  </div>
                  <div className="text-xs text-brand-muted">{t('expiresOn', { date: '12/25' })}</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="space-y-2 p-5 text-sm">
            <h2 className="font-semibold">{t('houseRules')}</h2>
            <p className="font-medium">{t('canView')}</p>
            <ul className="ml-5 list-disc space-y-1 text-brand-muted">
              <li>{t('viewList.0')}</li>
              <li>{t('viewList.1')}</li>
              <li>{t('viewList.2')}</li>
              <li>{t('viewList.3')}</li>
            </ul>
            <p className="mt-2 text-brand-muted">{t('cancelNote')}</p>
            <p className="text-brand-muted">{t('contactNote')}</p>
          </Card>
        </div>
      </div>

      <ContactHostDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        hostName={booking.unitSnapshot.ownerName}
      />
      <CancelBookingDialog
        booking={booking}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancelled={setBooking}
      />
      <ReviewDialog
        bookingId={booking.id}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => reviewsApi.getForBooking(booking.id).then(setReview)}
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'text-base font-bold' : ''}`}>
      <span className={bold ? '' : 'text-brand-muted'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-brand-muted">{label}</div>
      <div className={mono ? 'font-mono text-sm' : 'font-medium'}>{value}</div>
      {sub && <div className="text-xs text-brand-muted">{sub}</div>}
    </div>
  );
}
