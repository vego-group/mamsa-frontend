'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, CreditCard, MessageCircle, Download, X, ShieldCheck, MapPin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelBookingDialog } from '@/components/features/booking/CancelBookingDialog';
import { ReviewDialog } from '@/components/features/reviews/ReviewDialog';
import { bookingsApi, reviewsApi } from '@/lib/api/client';
import { formatDate, formatSAR } from '@/lib/utils/format';
import { isBookingCancellable } from '@/lib/cancellation/engine';
import type { Booking, Review } from '@/types';

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    bookingsApi.getById(bookingId).then(setBooking);
    reviewsApi.getForBooking(bookingId).then((r) => setReview(r));
  }, [bookingId]);

  if (!booking) return <div className="container mx-auto p-10">جاري التحميل...</div>;
  const canCancel = isBookingCancellable(booking, new Date());

  const statusBadge =
    booking.status === 'cancelled' ? <Badge variant="danger">ملغي</Badge>
    : booking.status === 'completed' ? <Badge variant="sage">مكتمل</Badge>
    : booking.status === 'confirmed' ? <Badge variant="success">مؤكد</Badge>
    : <Badge variant="warning">في انتظار التأكيد</Badge>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/my-reservations" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-primary">
        <ArrowRight className="h-4 w-4" /> العودة إلى الحجوزات
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <div></div>
        {statusBadge}
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left summary */}
        <aside className="space-y-4">
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold text-brand-ink">ملخص السعر</h2>
            <Row label={`${booking.price.pricePerNight} ر.س × ${booking.price.nights} ليالي`} value={formatSAR(booking.price.subtotal)} />
            <Row label="رسوم الخدمة" value={formatSAR(booking.price.serviceFee)} />
            <Row label="رسوم التنظيف" value={formatSAR(booking.price.cleaningFee)} />
            <Row label="الضرائب" value={formatSAR(booking.price.tax)} />
            <hr className="border-brand-border" />
            <Row label="المجموع الكلي" value={formatSAR(booking.price.total)} bold />
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-800">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <div className="font-semibold">دفع آمن ومحمي</div>
                <div>تم الدفع بنجاح وتأكيد الحجز</div>
              </div>
            </div>
          </Card>

          <Card className="space-y-2 p-3">
            <Button variant="outline" className="w-full" size="sm">
              <MessageCircle className="h-4 w-4" /> تواصل مع المضيف
            </Button>
            <Button variant="ghost" className="w-full" size="sm">
              <Download className="h-4 w-4" /> تحميل تأكيد الحجز
            </Button>

            {booking.status === 'confirmed' && canCancel && (
              <Button variant="danger" className="w-full" size="sm" onClick={() => setCancelOpen(true)}>
                <X className="h-4 w-4" /> إلغاء الحجز
              </Button>
            )}

            {booking.status === 'completed' && !review && (
              <Button variant="sage" className="w-full" size="sm" onClick={() => setReviewOpen(true)}>
                <Star className="h-4 w-4" /> كتابة تقييم
              </Button>
            )}
            {booking.status === 'completed' && review && (
              <div className="rounded-xl bg-green-50 p-2 text-center text-xs text-green-800">✓ تم التقييم</div>
            )}

            {(booking.status === 'completed' || booking.status === 'cancelled') && (
              <Button asChild variant="default" className="w-full" size="sm">
                <Link href={`/units/${booking.unitId}`}>احجز مرة أخرى</Link>
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
                <X className="h-4 w-4" /> تم الإلغاء بواسطة: {booking.refund.cancelledBy === 'customer' ? 'العميل' : 'النظام'}
              </div>
              <div className="space-y-1 text-sm text-red-900">
                {booking.refund.reason && <div>السبب: {booking.refund.reason}</div>}
                {booking.cancelledAt && <div>تاريخ الإلغاء: {formatDate(booking.cancelledAt.slice(0, 10))}</div>}
                <div>تم استرداد: {formatSAR(booking.refund.amount)} ({booking.refund.percent}%)</div>
              </div>
            </Card>
          )}

          <Card className="space-y-2 p-5">
            <h1 className="text-xl font-bold">{booking.unitSnapshot.title}</h1>
            <p className="flex items-center gap-1 text-sm text-brand-muted">
              <MapPin className="h-4 w-4" /> {booking.unitSnapshot.city}، {booking.unitSnapshot.country}
            </p>
            <p className="text-sm text-brand-muted">
              المرافق: {booking.guests.adults + booking.guests.children} ضيوف
            </p>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold">تفاصيل الحجز</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <Field label="تاريخ الوصول" value={formatDate(booking.checkInDate)} sub="بعد الساعة 3:00 مساءً" />
              <Field label="تاريخ المغادرة" value={formatDate(booking.checkOutDate)} sub="قبل الساعة 11:00 صباحًا" />
              <Field label="مدة الإقامة" value={`${booking.nights} ليالٍ`} />
              <Field label="الضيوف" value={`${booking.guests.adults} بالغين${booking.guests.children ? ` • ${booking.guests.children} طفل` : ''}`} />
              <Field label="رقم الحجز" value={booking.id} mono />
              <Field label="رمز التأكيد" value={booking.code} mono />
            </div>
          </Card>

          {booking.payment && (
            <Card className="space-y-2 p-5">
              <h2 className="font-semibold">طريقة الدفع</h2>
              <div className="flex items-center gap-3 rounded-xl border border-brand-border p-3">
                <CreditCard className="h-6 w-6 text-brand-primary" />
                <div>
                  <div className="font-medium">
                    {booking.payment.method === 'mada' ? 'Mada' : 'Visa'} •••• {booking.payment.last4}
                  </div>
                  <div className="text-xs text-brand-muted">تنتهي في 12/25</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="space-y-2 p-5 text-sm">
            <h2 className="font-semibold">قواعد المنزل</h2>
            <p className="font-medium">لكل حجز يمكن للعميل الاطلاع على:</p>
            <ul className="ml-5 list-disc space-y-1 text-brand-muted">
              <li>رقم الحجز وتاريخه</li>
              <li>تفاصيل الوحدة والموقع</li>
              <li>المبلغ الإجمالي والضرائب</li>
              <li>حالة الحجز الحالية</li>
            </ul>
            <p className="mt-2 text-brand-muted">يمكن للعميل إلغاء الحجز قبل موعد الإقامة وفق سياسة الإلغاء المحددة من الإدارة.</p>
            <p className="text-brand-muted">يمكنه التواصل مع مقدم الخدمة من داخل صفحة الحجز عبر محادثة مباشرة (نصوص وصور).</p>
          </Card>
        </div>
      </div>

      <CancelBookingDialog booking={booking} open={cancelOpen} onClose={() => setCancelOpen(false)} />
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
