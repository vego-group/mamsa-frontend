'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { unitsApi, bookingsApi } from '@/lib/api/client';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { Unit } from '@/types';

export function CheckoutPageClient() {
  const params = useParams<{ unitId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const checkIn = search.get('checkIn') ?? '';
  const checkOut = search.get('checkOut') ?? '';
  const guests = Number(search.get('guests') ?? '1');

  const [unit, setUnit] = useState<Unit | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    unitsApi.getById(params.unitId).then(setUnit);
  }, [params.unitId]);

  if (!unit) return <div className="container mx-auto p-10">جاري التحميل...</div>;

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const subtotal = unit.pricePerNight * nights;
  const cleaning = unit.cleaningFee ?? 0;
  const serviceFee = subtotal * ((unit.serviceFeePercent ?? 10) / 100);
  const tax = (subtotal + cleaning + serviceFee) * ((unit.taxPercent ?? 15) / 100);
  const total = subtotal + cleaning + serviceFee + tax;

  const handleConfirm = async () => {
    if (!agreed) { setError('يجب الموافقة على الشروط والسياسات'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookingsApi.create({
        unitId: unit.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: { adults: guests, children: 0 },
        paymentMethod: 'visa',
      });
      router.push(`/booking/confirmation/${booking.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إنشاء الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-6 md:order-2">
        <h1 className="text-2xl font-bold">تأكيد الدفع</h1>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">رحلتك</h2>
          <Row label="التواريخ" value={`${formatDate(checkIn)} → ${formatDate(checkOut)}`} />
          <Row label="الضيوف" value={`${guests} ضيف`} />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">معلوماتك الشخصية</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input placeholder="أدخل الاسم الأول" />
            </div>
            <div className="space-y-2">
              <Label>اسم العائلة</Label>
              <Input placeholder="أدخل اسم العائلة" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="example@email.com" dir="ltr" className="text-start" />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <PhoneInput placeholder="5XXXXXXXX" dir="ltr" className="text-start" />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">معلومات الدفع</h2>
          <div className="space-y-2">
            <Label>رقم البطاقة</Label>
            <Input placeholder="1234 5678 9012 3456" dir="ltr" className="text-start font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Input placeholder="MM/YY" dir="ltr" className="text-start" />
            </div>
            <div className="space-y-2">
              <Label>CVV</Label>
              <Input placeholder="123" dir="ltr" className="text-start" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>الاسم على البطاقة</Label>
            <Input placeholder="الاسم كما هو مكتوب على البطاقة" />
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">سياسة الإلغاء (سيتم تجميدها مع الحجز)</h2>
          <CancellationPolicyDisplay policy={getPolicyByTemplate(unit.cancellationPolicy)} showHeader={false} />
        </Card>

        <Card className="space-y-2 p-5 text-sm">
          <label className="flex items-start gap-2">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
            <span className="text-brand-muted">
              أوافق على{' '}
              <a className="text-brand-primary underline">سياسة الإلغاء</a>،{' '}
              <a className="text-brand-primary underline">قواعد الأمان الأساسية</a>،{' '}
              و
              <a className="text-brand-primary underline"> قواعد البيت</a>.
              كما أوافق على أن يفرض الموقع رسوماً على وسيلة الدفع الخاصة بي في حال كنت مسؤولاً عن الأضرار.
            </span>
          </label>
        </Card>

        {error && <p className="text-sm text-status-danger">{error}</p>}

        <Button size="lg" className="w-full" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'جاري المعالجة...' : 'تأكيد الدفع'}
        </Button>
      </div>

      <aside className="md:order-1">
        <Card className="sticky top-24 space-y-4 p-5">
          <div className="flex items-center gap-3">
            <img src={unit.imageUrls[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <div className="text-sm">
              <div className="font-semibold">{unit.title}</div>
              <div className="text-xs text-brand-muted">{unit.city}، {unit.country}</div>
            </div>
          </div>
          <hr className="border-brand-border" />
          <h3 className="font-semibold">تفاصيل السعر</h3>
          <Row label={`${unit.pricePerNight} ر.س × ${nights} ليالي`} value={formatSAR(subtotal)} />
          <Row label="رسوم النظافة" value={formatSAR(cleaning)} />
          <Row label="رسوم الخدمة" value={formatSAR(serviceFee)} />
          <Row label="الضرائب" value={formatSAR(tax)} />
          <hr className="border-brand-border" />
          <Row label="المجموع (ر.س)" value={formatSAR(total)} bold />
        </Card>
      </aside>
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
